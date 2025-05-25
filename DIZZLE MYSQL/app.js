import express from 'express';
import { env } from './config/env.js';
import path from 'path';
import { shortenedRoutes } from './routes/shortened.routes.js';
import { eq } from 'drizzle-orm';
import {db} from './config/db.js';
import {usersTable} from './drizzle/schema.js'

import requestIp from 'request-ip';
import { authRoutes } from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import {verifyAuthentication} from './middlewares/verify-auth-middleware.js';
import session from 'express-session';
import flash from 'connect-flash';
// const main = async()=>{
    //INSERT
        // const insertUser = await db.insert(usersTable).values({
        //     name:"Rikesh Shrestha",
        //     age:11,
        //     email:"rikeshshrestha9821@gmail.com"
        // });
        // console.log(insertUser);
        
        // const insertUser = await db.insert(usersTable).values([
        //     {name:"Rikesh Shrestha1",age:12,email:"rikeshshrestha982@gmail.com"},
        //     {name:"Rikesh Shrestha2",age:13,email:"rikeshshrestha98@gmail.com"},
        //     {name:"Rikesh Shrestha3",age:14,email:"rikeshshrestha9@gmail.com"},
        //     {name:"Rikesh Shrestha4",age:15,email:"rikeshshrestha@gmail.com"},
        //     {name:"Rikesh Shrestha5",age:16,email:"rikeshshrestha1234@gmail.com"}
        // ]);
        // console.log(insertUser);
    
    
    //READ
        // const insertUser = await db.select().from(usersTable);
        // console.log(insertUser);
        
        // Not Recommended
        // const selectedUser = await db.select().from(usersTable).where({email : "rikeshshrestha9821@gmail.com"});
        // console.log(selectedUser);

        // Recommended
        // const selectedUser = await db.select().from(usersTable).where(eq(usersTable.email, "rikeshshrestha9821@gmail.com"));
        // console.log(selectedUser);
    
    //UPDATE
        // Not Recommended
        // const updatedUser = await db.update(usersTable).set({name : "Rikesh Hero"}).where({email : "rikeshshrestha9821@gmail.com"});
        // console.log(updatedUser);

        // Recommended
        // const updatedUser = await db.update(usersTable).set({name : "Rikesh Shrestha"}).where(eq(usersTable.email, "rikeshshrestha9821@gmail.com"));
        // console.log(updatedUser);
    
    
    //DELETE
    // await db.delete(usersTable).where(eq(usersTable.email, "rikeshshrestha9821@gmail.com"));
// }
// main().catch((err)=>{console.log(err);
// });


// import 'dotenv/config';


const app = express();

app.use(cookieParser());

app.use(session({secret:"my_secret", resave: true, saveUninitialized:false}));
app.use(flash());

// This must be after cookie parser
app.use(verifyAuthentication);

app.use(requestIp.mw());

app.use((req, res, next)=>{
res.locals.user = req.user;
return next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add this line to serve static files
app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(authRoutes);
app.use(shortenedRoutes);
app.set("view engine", "ejs");
app.set("views", "./views");
app.use((req, res) => {
  return res.status(404).sendFile(path.join(import.meta.dirname, "views", "404.ejs"));
});

app.listen(env.PORT, () => {
  console.log(`Server is running at PORT:${env.PORT}`);
});
