import { eq } from 'drizzle-orm';
import {db} from '../config/db.js'
import {shortLinksTable} from '../drizzle/schema.js';
export const loadlinks  = async(userId)=>{
return await db.select().from(shortLinksTable).where(eq(shortLinksTable.userId, userId));
}
export const saveLinks = async ({url, shortCode, userId}) => {
  const result = await db.insert(shortLinksTable).values({shortCode: shortCode,url, userId});
};

export const getLinkByShortCode = async(shortCode)=>{
const [result] = await db.select().from(shortLinksTable).where(eq(shortLinksTable.shortCode, shortCode));
return result;
        }

export const findShortLinkById = async(id)=>{
  const [result] = await db
                         .select()
                         .from(shortLinksTable)
                         .where(eq(shortLinksTable.id, id));
  return result;
}

// deleteShortCodeById
export const deleteShortCodeById = async(id)=>{
  return await db
                .delete(shortLinksTable)
                .where(eq(shortLinksTable.id, id));
}