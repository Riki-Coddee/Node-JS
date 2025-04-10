import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loadlinks = async()=>{  
 const row = await prisma.shortlink.findMany();
return row;
}


export const saveLinks = async ({url, shortCode}) => {
   const newShortLink = prisma.shortlink.create({
    data:{
         shortCode,
         url
    }
   })
return newShortLink;
  };

export const getLinkByShortCode = async(shortCode)=>{
const shortLink = await prisma.shortlink.findUnique({where : {shortCode : shortCode}});
return shortLink;
        }