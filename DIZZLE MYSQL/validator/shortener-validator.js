import z from 'zod';
export const shortenerSchema = z.object({
     url: z
        .string({required_error: "URL is required."})
        .trim()
        .url({message:"Please enter a valid URL."})
        .max(1024,{message:"URL cannot be longer than 1024 charaters."}),
      shortCode: z
      .string({required_error: "ShortCode is required."})
      .trim()
      .min(2,{message:"ShortCode cannot be less than 2 charaters."})
      .max(50,{message:"ShortCode cannot be longer than 50 charaters."}),
})