
import { db } from '../config/db.js';
import {usersTable} from './drizzle/schema.js'

export const loadlinks = async()=>{
const row = await db.select().from(usersTable);
return row;
}

export const saveLinks = async ({url, shortCode}) => {
  const [result] = await db.insert(usersTable).values({shortCode: shortCode, url: url});
};

export const getLinkByShortCode = async(shortCode)=>{
const rows = await db.select().from(usersTable).where({shortCode});
        }