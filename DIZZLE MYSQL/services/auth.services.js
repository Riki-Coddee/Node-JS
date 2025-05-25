import { and, eq, gt, gte, lt, sql } from 'drizzle-orm';
import {db} from '../config/db.js';
import {oauthAccountsTable, passwordResetTokensTable, sessionsTable, usersTable, verifyEmailTokensTable} from '../drizzle/schema.js';
import crypto from 'crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, MILLISECONDS_PER_SECOND, REFRESH_TOKEN_EXPIRY } from '../config/constants.js';
// import { sendEmail } from '../lib/nodemailer.js';
import { sendEmail } from '../lib/send-mail.js';
import path from 'path';
import  fs  from 'fs/promises';
import ejs from 'ejs';
import mjml2html from 'mjml';
import { log } from 'console';
  
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET is not defined in env');


// Get User by Email
export const getUserByEmail = async(email)=>{
    const [user] = await db
                         .select()
                         .from(usersTable)
                         .where(eq(usersTable.email, email));

    return user;
}

// Create a User
export const createUser = async ({name, email, password}) => {  
    const result = await db.insert(usersTable).values({
      name,
      email,
      password,
    });
    const insertId = result[0].insertId;
  
    return { id: insertId }; 
  };

// Hash the Passowrd
  export const hashPassword = async(password)=>{
    return await argon2.hash(password);
  }

// Veify hash Passowrd
  export const verifyPassword = async(hashedPassword, password)=>{
    return await argon2.verify(hashedPassword, password);
  }  
  // export const generateToken = ({ id, name, email }) => {
  //   return jwt.sign({ id, name, email }, jwtSecret, {
  //     expiresIn: '30d',
  //   });
  // };

  export const verifyToken = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  export const createSession = async (userId, { ip, userAgent }) => {
    const result = await db.insert(sessionsTable).values({
      userId,
      ip,
      userAgent
    });
  
    // Drizzle MySQL insert returns an array with metadata
    const insertId = result[0].insertId;
  
    return { id: insertId }; // ✅ Now you can access session.id
  };
  
  export const createAccessToken = ({id, name, email, isEmailValid, sessionId})=>{
   return jwt.sign({id, name, email, isEmailValid, sessionId}, process.env.JWT_SECRET,{
    expiresIn : ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND
   });
  }

  export const createRefreshToken = (sessionId)=>{
    return jwt.sign({sessionId}, process.env.JWT_SECRET,{
     expiresIn : REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND
    });
   }
   
   export const findSessionById = async(sessionId)=>{
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, sessionId));
    return session;
   }

   export const findUserById =async(userId)=>{
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    return user;
   }
   export const findUserByEmail = async(email)=>{
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
   }
   export const updateUserByName = async({userId, name, avatarURL})=>{
    return db.update(usersTable).set({name:name, avatarURL}).where(eq(usersTable.id, userId));
   }
   export const refreshTokens = async (refreshToken) => {
    try {
      const decodedToken = verifyToken(refreshToken);  

      const currentSession = await findSessionById(decodedToken.sessionId);
  
      if (!currentSession || !currentSession.valid) {
        throw new Error("Invalid session.");
      }
  
      const user = await findUserById(currentSession.userId);
      if (!user) {
        throw new Error("Invalid user.");
      }
  
      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailValid: user.isEmailValid,
        sessionId: currentSession.id, // use proper camelCase
      };
  
      const newAccessToken = createAccessToken(userInfo);
      const newRefreshToken = createRefreshToken(currentSession.id);
  
      return { newAccessToken, newRefreshToken, user: userInfo };
    } catch (error) {
      console.error("Refresh Token Error:", error.message);
      throw error;
    }
  };
  
  export const clearUserSession=async(sessionId)=>{
    return await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  }

  export const authenticateUser = async({req, res, user, name, email})=>{
    const session = await createSession(user.id, {
      ip: req.clientIp,
      userAgent:req.headers["user-agent"], 
  });   
  
  const accessToken = createAccessToken({
      id: user.id,
      name: user.name || name,
      email: user.email || email,
      isEmailValid:user.isEmailValid || false,
      sessionId: session.id,
  })
  const refeshToken = createRefreshToken(session.id);
  const baseConfig = {httpOnly:true, secure:true};

  res.cookie("access_token", accessToken,{
     ...baseConfig,
     maxAge: ACCESS_TOKEN_EXPIRY,
  })
  res.cookie("refresh_token", refeshToken,{
     ...baseConfig,
     maxAge: REFRESH_TOKEN_EXPIRY,
  })
  }
  export const getPasswordResetToken = async(token)=>{
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    
    const [data] = await db.select().from(passwordResetTokensTable).where(
      and(
        eq(passwordResetTokensTable.tokenHash, tokenHash),
        gte(passwordResetTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    );
    return data;
  }

  export const generateRandomToken = (digit = 8)=>{
    const min = 10 ** (digit - 1); //100000000
    const max = 10 ** digit; //1000000000
    return crypto.randomInt(min, max).toString();
  }
 export const createResetPasswordLink = async({userId})=>{
  const randomToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(randomToken).digest("hex");
  console.log(userId);
  
  await clearResetPasswordToken(userId);

  await db.insert(passwordResetTokensTable).values({userId, tokenHash});

  return `${process.env.FRONTEND_URL}/reset-password/${randomToken}`;
 }
//  Delete all existing password reset token of specified user if exist 
export const clearResetPasswordToken =async(userId)=>{
  return await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));
}
  export const insertVerifyEmailToken = async({userId, token})=>{
    await db.transaction(async(tx)=>{
      try {
        await db.delete(verifyEmailTokensTable).where(lt(verifyEmailTokensTable.expiresAt, sql`(CURRENT_TIMESTAMP)`));
        await db.delete(verifyEmailTokensTable).where(eq(verifyEmailTokensTable.userId, userId));
      await db.insert(verifyEmailTokensTable).values({userId, token});
      } catch (error) {
        console.log("Failed to insert the verification token.",error);
        throw new Error("Unable to create the verification token");      
      }
    })    
  }

  export const createVerifyEmailLink = async({email, token})=>{
    // const uriEncodedEmail = encodeURIComponent(email);
    // return `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${uriEncodedEmail}`;
    const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);
    url.searchParams.append('token', token);
    url.searchParams.append('email', email);
    return url.toString();
  }

  export const findVerificationEmailToken = async ({ token, email }) => {
    return db
      .select({
        userId: usersTable.id, // make sure this matches your schema
        email: usersTable.email,
        token: verifyEmailTokensTable.token,
        expiredAt: verifyEmailTokensTable.expiresAt,
      })
      .from(verifyEmailTokensTable)
      .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id))
      .where(
        and(
          eq(verifyEmailTokensTable.token, token),
          gt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
          eq(usersTable.email, email)
        )
      );
  };  
  export const verifyUserEmailAndUpdate = async(email)=>{
     return db.update(usersTable).set({isEmailValid:true}).where(eq(usersTable.email, email));
  }
  export const clearVerifyEmail = async(userId)=>{
    return db.delete(verifyEmailTokensTable).where(eq(verifyEmailTokensTable.userId, userId));
  }

  export const sendNewVerifyEmailLink = async({userId, email}) => {
    try {
        const randomToken = generateRandomToken();
        await insertVerifyEmailToken({userId, token: randomToken});

        const verifyEmailLink = await createVerifyEmailLink({
            email,
            token: randomToken,
        });
        const templatePath = path.resolve(import.meta.dirname, '../emails/verify-email.mjml');

        // Read template file with error handling
        let mjmlTemplate;
        try {
            mjmlTemplate = await fs.readFile(templatePath, 'utf-8');
            
            // Verify template content
            if (!mjmlTemplate.trim()) {
                throw new Error('Template file is empty');
            }
        } catch (err) {
            console.error('Failed to read template file:', err);
            
            // Fallback to hardcoded template
            console.log('Using fallback template');
            mjmlTemplate = `<!-- Your MJML template here -->`;
        }

        // Render template
        const filledTemplate = ejs.render(mjmlTemplate, {
            code: randomToken,
            link: verifyEmailLink,
        });

        // Convert to HTML
        const { html, errors } = mjml2html(filledTemplate);
        
        if (errors && errors.length > 0) {
            console.error('MJML conversion errors:', errors);
            throw new Error('Failed to convert MJML to HTML');
        }

        // Send email
        await sendEmail({
            to: email,
            subject: "Verify your email",
            html: html,
        });

    } catch (error) {
        console.error('Error in sendNewVerifyEmailLink:', error);
        throw error; // Re-throw to handle in controller
    }
}
export const updateUserPassword = async({userId, newPassword})=>{
  const newHashPassword = await hashPassword(newPassword);
  return await db.update(usersTable).set({password: newHashPassword}).where(eq(usersTable.id, userId));
}

// getUserWithOauthId
export const getUserWithOauthId = async ({ provider, email }) => {
  const results = await db
    .select({
      id: usersTable.id,
      name:usersTable.name,
      email:usersTable.email,
      isEmailValid: usersTable.isEmailValid,
      provider: oauthAccountsTable.provider,
      providerAccountId: oauthAccountsTable.providerAccountId,
    })
    .from(usersTable)
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.userId, usersTable.id), // Changed from usersTable.userId to usersTable.id
        eq(oauthAccountsTable.provider, provider)
      )
    )
    .where(eq(usersTable.email, email));

  return results[0] || null; // Return first result or null
};


// linkUserWithOauth
export const linkUserWithOauth = async({userId, provider, providerAccountId})=>{
  return await db.insert(oauthAccountsTable).values({userId, provider, providerAccountId});
}

//createUserWithOauth
export const createUserWithOauth = async({ name, email, provider, providerAccountId }) => {
  const user = await db.transaction(async(trx) => {
    // Insert user and get the generated ID
    const [userResult] = await trx.insert(usersTable).values({
      name,
      email,
      isEmailValid: true
    });

    const userId = userResult.insertId;
    console.log(userId);
    
    
    // Insert OAuth account - ensure all required fields are included
    await trx.insert(oauthAccountsTable).values({
      userId, // This must match your schema field name
      provider, 
      providerAccountId
      // createdAt is automatically handled by defaultNow()
    });

    return {
      name,
      email,
      isEmailValid: true,
      provider,
      providerAccountId
    };
  });

  return user;
}