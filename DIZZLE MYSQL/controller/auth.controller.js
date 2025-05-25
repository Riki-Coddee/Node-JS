import { eq } from "drizzle-orm";
import { ACCESS_TOKEN_EXPIRY, OAUTH_EXCHANGE_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import {  createAccessToken, createRefreshToken, createSession, createUser, getUserByEmail, hashPassword, verifyPassword, clearUserSession, authenticateUser, findUserById, clearVerifyEmail, findVerificationEmailToken, verifyUserEmailAndUpdate, sendNewVerifyEmailLink, updateUserByName, updateUserPassword, createResetPasswordLink, findUserByEmail, getPasswordResetToken, clearResetPasswordToken, createUserWithOauth, linkUserWithOauth, getUserWithOauthId } from "../services/auth.services.js";
import { loadlinks } from "../services/shortener.services.js";
import { forgotPasswordSchema, loginUserSchema, registerUserSchema, setPasswordSchema, verifyEmailSchema, verifyNameSchema, verifyPasswordSchema, verifyResetPasswordSchema } from "../validator/auth-validator.js";
import { error, log } from "console";
import { getHtmlFromMjmlTemplate } from "../lib/get-html-from-mjml-template.js";
import { sendEmail } from "../lib/send-mail.js";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import {google} from "../lib/oauth/google.js";
import {github} from "../lib/oauth/github.js";

export const getRegisterPage = (req, res)=>{
 if(req.user) return res.redirect('/');

 return res.render('auth/register.ejs', {errors:req.flash("errors")});
}
export const getLoginPage = (req, res)=>{
 if(req.user) return res.redirect('/');

 return res.render('auth/login.ejs', {errors:req.flash("errors")});
}


// PostLogin 
export const postLogin = async(req, res)=>{
    if(req.user) return res.redirect('/');

   const {data, error} = loginUserSchema.safeParse(req.body);
   if(error){
       const errors = error.errors[0].message;
       req.flash("errors", errors);
       return res.redirect('/login');
    }
    const {email, password} = data;
    
    const user = await getUserByEmail(email);
    if(!user) {
        req.flash("errors", "Invalid email or password.");
        return res.redirect('/login');
    }
    if(!user.password){
        req.flash("errors", "You have created account using social login. Please login with your social account.");
        res.redirect("/login");
    }
    if(!await verifyPassword(user.password, password)){ 
        req.flash("errors", "Invalid email or password.");
        return res.redirect('/login');
    }
    
    // const token = generateToken({
    //     id: userExist.id,
    //     name: userExist.name,
    //     email: userExist.email
    // })
    // res.cookie("access_token", token);
    // res.cookie('Set-Cookie','isLoggedIn=true; path=/;');
    
    await authenticateUser({req, res, user});
    return res.redirect('/');
}

export const postRegister = async(req, res)=>{
    if(req.user) return res.redirect('/');
   const {data, error} = registerUserSchema.safeParse(req.body);
   if(error){
       const errors = error.errors[0].message;
       req.flash("errors", errors);
       return res.redirect('/register');
    }
    const {name, email, password} = data;
    const userExist = await getUserByEmail(email);
    if(userExist) {        
        req.flash("errors", "User alrerady Exists.");
        return res.redirect('/register');
    }
    const hashedPassword = await hashPassword(password);
    
    const user = await createUser({name, email, password : hashedPassword});    
    // res.redirect('/login');
   
   await authenticateUser({req, res, user, name, email});
   await sendNewVerifyEmailLink({userId:user.id, email:email});
    return res.redirect('/');
 }
 export const getMe = async(req, res)=>{
    if(!req.user) return res.send("You're Not Logged In.");
    return res.send(`Hey! ${req.user.name}. Your email address is ${req.user.email}.`);
 } 

 export const getProfilePage = async(req, res)=>{
    if(!req.user) return res.redirect('/login');

    const user = await findUserById(req.user.id);
    if(!user) return res.redirect('/login');

    const userShortLinks = await loadlinks(user.id);

    return res.render('auth/profile',{
        user:{
            avatarURL: user.avatarURL,
            id:user.id,
            name: user.name,
            email:user.email,
            hasPassword: Boolean(user.password),
            isEmailValid: user.isEmailValid,
            createdAt:user.createdAt,
            links:userShortLinks
        }
    });
 }
 export const getEditProfilePage = async(req, res)=>{
    if(!req.user) return res.redirect("/login");

    const user = await findUserById(req.user.id);
    if(!user) return res.status(404).send("User not found.");

    return res.render("auth/edit-profile.ejs",{
       name : user.name,
       avatarURL: user.avatarURL,
       errors : req.flash("errors")
    });
 }
 export const getChangePasswordPage = async(req, res)=>{
    if(!req.user) return res.redirect("/login");

    return res.render("auth/change-password",{
        errors: req.flash("errors")
    });
 }
 export const postChangePasswordPage = async(req, res)=>{
    if(!req.user) return res.redirect("/login");
     
    const {data, error} = verifyPasswordSchema.safeParse(req.body);
    if(error){
        const errorMessages = error.errors.map((err)=>err.message);
        req.flash("errors", errorMessages);
        return res.redirect("/change-password");
    }

    const {currentPassword, newPassword} = data;

    const user = await findUserById(req.user.id);
    if(!user) return res.status(404).send("User not Found.");

    const isPasswordValid = await verifyPassword(user.password, currentPassword);
    if(!isPasswordValid){
       req.flash("errors", "Current Password is invalid");
       return res.redirect("/change-password");
    }

    await updateUserPassword({userId: user.id, newPassword});

    return res.redirect('/profile');
 }
 export const getForgotPasswordPage = (req, res)=>{
    return res.render("auth/forgot-password",{
        formSubmitted: req.flash("formSubmitted")[0],
        errors: req.flash("errors")
    })
 }
 export const postForgotPasswordPage = async(req, res)=>{
    const {data, error} = forgotPasswordSchema.safeParse(req.body);
    if(error){
        const errorMessage = error.errors.map((err)=>err.message);
        req.flash("errors", errorMessage);
        return res.redirect("/forgot-password");
    }

    const user = await findUserByEmail(data.email);        
    if(user){
        const resetPasswordLink = await createResetPasswordLink({userId : user.id});
        const html = await getHtmlFromMjmlTemplate("reset-password-email",{
            name: user.name,
            link: resetPasswordLink
          })
          sendEmail({
            to: user.email,
            subject:"Reset Your Password",
            html
          });    
    }
    else{
        req.flash("errors", "Email Address is not registered.");
        return res.redirect("/forgot-password");
    }
    req.flash("formSubmitted", true);
    res.redirect("/forgot-password");
 }
 export const postEditProfilePage = async(req, res)=>{
    if(!req.user) return res.redirect("/");

    const user = await findUserById(req.user.id);
    if(!user) return res.status(404).send("User not found.");

    const {data, error} = verifyNameSchema.safeParse(req.body);
    if(error){
        const errorMessage = error.errors.map((err)=>err.message);
        req.flash("errors", errorMessage);
        return res.redirect("/edit-profile");
    }
    const fileURL = req.file ? `uploads/avatars/${req.file.filename}` : undefined;
    console.log(fileURL);
    
    await updateUserByName({userId: req.user.id, name:data.name, avatarURL: fileURL});
    res.redirect("/profile");
 }
export const verifyEmail = async(req, res)=>{
    if(!req.user) return res.redirect('/login');
    
    const user = await findUserById(req.user.id);
    if(user.isEmailValid) return res.redirect("/");
    return res.render("auth/verify-email", {email : req.user.email});
}

export const resendVerificationLink = async(req, res)=>{
    if(!req.user) return res.redirect('/login');

    const user = await findUserById(req.user.id);
    if(!user || user.isEmailValid) return res.redirect("/");

    await sendNewVerifyEmailLink({userId:req.user.id, email:req.user.email});

    res.redirect("/verify-email");
}
export const verifyEmailToken = async (req, res) => {
    const {data, error} = verifyEmailSchema.safeParse(req.query);
    if(error) return res.send("Verification link invalid or expired.");

    const [token] = await findVerificationEmailToken(data);    
    if(!token) return res.send("Verification link invalid or expired.");

    await verifyUserEmailAndUpdate(token.email);

    clearVerifyEmail(token.userId).catch(console.error);

    return res.redirect("/profile");
}
export const getResetPasswordTokenPage = async(req, res)=>{
    const {token} = req.params;    
    const passwordResetData = await getPasswordResetToken(token);
    if(!passwordResetData) return res.render("auth/wrong-reset-password");
    
    return res.render("auth/reset-password",{
        formSubmitted: req.flash("formSubmitted")[0],
        errors: req.flash("errors"),
        token
    });
}
export const postResetPasswordTokenPage = async(req, res)=>{
    const {token} = req.params;    
    const passwordResetData = await getPasswordResetToken(token);
    if(!passwordResetData) {
        req.flash('errors', "Password token is not matching");
        return res.render("auth/wrong-reset-password")};
    
    const {data, error} = verifyResetPasswordSchema.safeParse(req.body);
    if(error){
        const errorMessages = error.errors.map((err)=> err.message);
        req.flash("errors", errorMessages[0]);
        return res.redirect('/reset-password');
    }

    const {newPassword} = data;

    const user = await findUserById(passwordResetData.userId);

    await clearResetPasswordToken(user.id);

    await updateUserPassword({userId: user.id, newPassword});

    return res.redirect("/login");

}

//getGoogleLoginPage
export const getGoogleLoginPage = async(req, res)=>{
    if(req.user) return res.redirect("/");

    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(state, codeVerifier, [
        //This is called scopes, here we are giving openid and profile
        "openid",//openid gives tokens if needed
        "profile",//profile gives user information
        "email",//email gives the email username and information
    ]);

    const cookieConfig = {
        httpOnly: true,
        secure: true,
        maxAge: OAUTH_EXCHANGE_EXPIRY,
        sameSit: "lax"
    } 
    res.cookie("google_oauth_state", state, cookieConfig);
    res.cookie("google_code_verifier", codeVerifier, cookieConfig);

    res.redirect(url.toString());
}

//getGoogleLoginCallBack
export const getGoogleLoginCallBack = async(req, res)=>{
   const {state, code} = req.query;

   const {
    google_oauth_state : storedState,
    google_code_verifier: codeVerifier,
   }=req.cookies;

   if(!code ||
      !state ||
      !storedState ||
      !codeVerifier ||
      state !== storedState
   ){
    req.flash("errors", "Couldn't login with google because of invalid login attempt. Please try again.");
    return res.redirect("/login");
   }
  
   let tokens;
   try {
     tokens = await google.validateAuthorizationCode(code, codeVerifier);
   } catch{
    req.flash("errors", "Couldn't login with google because of invalid login attempt. Please try again.");
    return res.redirect("/login");
   }
   const claims = decodeIdToken(tokens.idToken());
   const {sub:googleUserId, name, email}= claims;
  
  let user = await getUserWithOauthId({
    provider:"google",
    email
   });
  
   if(user && !user.providerAccountId){
    await linkUserWithOauth({
        userId: user.id,
        provider:"google",
        providerAccountId: googleUserId
    });
   }

   if(!user){
        user = await createUserWithOauth({
        name,
        email,
        provider: "google",
        providerAccountId : googleUserId
    });
   }

   await authenticateUser({req, res, user, name, email});

   res.redirect("/");
}
 export const logoutUser = async(req, res)=>{
    await clearUserSession(req.user.sessionId);
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.redirect('/login');
 }

 export const getGithubPage = async(req, res)=>{
    if(req.user) return res.redirect("/");

    const state = generateState();

    const url = github.createAuthorizationURL(state, ["user:email"]);

    const cookieConfig = {
        httpOnly: true,
        secure: true,
        maxAge: OAUTH_EXCHANGE_EXPIRY,
        sameSit: "lax"
    } 
    res.cookie("github_oauth_state", state, cookieConfig);

    res.redirect(url.toString());
 }
 export const getGithubLoginCallBack = async(req, res)=>{
  const {state, code} = req.query;
  const {github_oauth_state : storedState}=req.cookies;
   
  function handleFailedLogin(){
    req.flash("errors", `Couldn't Login with Github because of invalid login attempt. Please try again!`);
    return res.redirect("/login");
  }
   if(!code ||
      !state ||
      !storedState ||
      state !== storedState
   ){
    handleFailedLogin();
   }
  
   let tokens;
   try {
     tokens = await github.validateAuthorizationCode(code);
   } catch{
    handleFailedLogin();
   }
   const githubUserResponse = await fetch("https://api.github.com/user",{
    headers:{
        Authorization: `Bearer ${tokens.accessToken()}`,
    },
   });
   if(!githubUserResponse) return handleFailedLogin();
   const githubUser = await githubUserResponse.json();
   const {id: githubUserId, name} = githubUser;

   const githubEmailResponse = await fetch("https://api.github.com/user/emails",{
    headers:{
        Authorization: `Bearer ${tokens.accessToken()}`,
    },
   }); 
   if(!githubEmailResponse) return handleFailedLogin();

   const emails =await githubEmailResponse.json();
   const email = emails.filter((e)=>e.primary)[0].email;
   if(!email) return handleFailedLogin();
  
  let user = await getUserWithOauthId({
    provider:"github",
    email
   });
  
   if(user && !user.providerAccountId){
    await linkUserWithOauth({
        userId: user.id,
        provider:"github",
        providerAccountId: githubUserId
    });
   }

   if(!user){
        user = await createUserWithOauth({
        name,
        email,
        provider: "github",
        providerAccountId : githubUserId
    });
   }

   await authenticateUser({req, res, user, name, email});

   res.redirect("/");  
 }

//  getSetPasswordPage
export const getSetPasswordPage =async(req, res)=>{
    if(!req.user) return res.redirect("/login");

    return res.render("auth/set-password",{
        errors : req.flash("errors")
    })
}
export const postSetPasswordPage = async(req, res)=>{
        if(!req.user) return res.redirect("/login");

        const {data, error} = setPasswordSchema.safeParse(req.body);

        if(error){
        const errorMessage = error.errors.map((err)=>err.message);
        req.flash("errors", errorMessage);
        return res.redirect("/set-password");
        }

        const user = await findUserById(req.user.id);
        if(user.password){
            req.flash("errors", "You already have your password. Instead change your password");
            return res.redirect("/set-password");
        }

        const {newPassword} =data;
        
        await updateUserPassword({userId: user.id, newPassword});
        return res.redirect("/profile");

}