import z from 'zod';
export const nameSchema =  z
                        .string()
                        .trim()
                        .min(3, {message: "Name must be atleast 3 character long."})
                        .max(100,{message:"Name must be not exceed 100 charaters."});
export const emailSchema = z 
                        .string()
                        .trim()
                        .email({message:"Please enter a valid email address."})
                        .max(100,{message:"Email must be no more than 100 charaters."});
export const newPasswordSchema= z
                        .string()
                        .min(6, {message: "New Password must be atleast 6 characters long."})
                        .max(100,{message: "New password must be no more than 100 characters."});
export const confirmPasswordSchema = z 
                              .string()
                              .min(6, {message: "Confirm Password must be atleast 6 characters long."})
                              .max(100,{message: "Confirm password must be no more than 100 characters."});
export const registerUserSchema = z.object({
      name: nameSchema,
      email: emailSchema,
      password: z
            .string()
            .min(6,{message:"Password ust be atleast 6 characters."})
            .max(100,{message:"Password must not exceed 100 characters."})
})

export const loginUserSchema = z.object({
    email: emailSchema,
    password: z
          .string()
          .min(6,{message:"Password ust be atleast 6 characters."})
          .max(100,{message:"Password must not exceed 100 characters."})
})
export const verifyEmailSchema = z.object({
      token: z.string().trim().length(8),
      email: z.string().trim().email(),
})
export const verifyNameSchema = z.object({
      name: nameSchema
})
export const verifyPasswordSchema = z.object({
      currentPassword : z
                        .string()
                        .min(1, {message: "Current Password is required."}),

      newPassword : newPasswordSchema,
      
      confirmPassword : confirmPasswordSchema,

}).refine((data)=> data.newPassword === data.confirmPassword,{
      message: "Passwords dont match.",
      path:["confirmPassword"]
});
export const passwordSchema =z.object({
      newPassword : newPasswordSchema,
      confirmPassword : confirmPasswordSchema, 
}).refine((data)=> data.newPassword === data.confirmPassword,{
      message: "Passwords dont match.",
      path:["confirmPassword"]
});
export const verifyResetPasswordSchema = passwordSchema;
export const setPasswordSchema = passwordSchema;
export const forgotPasswordSchema = z.object({
              email: emailSchema
})