import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "damaris.boyer44@ethereal.email",
    pass: "pmeWrQSy4SZngJ4n6Y",
  },
});

export const sendEmail = async({to, subject, html})=>{
    const info = await transporter.sendMail({
        from:`'URL SHORTENER' < ${testAccount.user} >`,
        to, 
        subject, 
        html
    });
    const testEmailURL = nodemailer.getTestMessageUrl(info);
    console.log("verify Email:", testEmailURL);
    
}