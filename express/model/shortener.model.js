import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
// import { dbClient } from '../config/db-client.js';
import { db } from '../config/db-client.js';
import { env } from '../config/env.js';

// Fetching data using file
// const DATA_FILE = path.join("data", "links.json");
// console.log(DATA_FILE);

// export const loadlinks = async()=>{
//       try {
//         const data = await readFile(DATA_FILE, "utf-8");
//         return JSON.parse(data);
//       } catch (error) {
//         if (error.code === "ENOENT") {
//           await writeFile(DATA_FILE, JSON.stringify({}));
//           return {};
//         }
//         throw error;
//       }    
// }
// export const saveLinks = async (links) => {
//     await writeFile(DATA_FILE, JSON.stringify(links));
//   };

// Fetching data using mongodb
// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shortener");


export const loadlinks = async()=>{
  // try {
  //   return shortenerCollection.find().toArray();
  //         } catch (error) {
  //           if (error.code === "ENOENT") {
  //             await writeFile(DATA_FILE, JSON.stringify({}));
  //             return {};
  //           }
  //           throw error;
  //         }
  
  
// Mysql
const [row] = await db.execute(`select * from short_links`);
return row;
}

    export const saveLinks = async ({url, shortCode}) => {
      // Mongodb
// return shortenerCollection.insertOne(link);

// Mysql
const [result] = await db.execute(`insert into short_links (short_code, url) values (?,?)`,
  [shortCode,url]);

        };

        export const getLinkByShortCode = async(shortCode)=>{
          // Mongo
// return await shortenerCollection.findOne({shortCode});

// Mysql
const [rows] = await db.execute(`select * from short_links where short_code = ?`,[shortCode]);

if (rows.length > 0) {
  return rows[0];
} else {
  return null;
}
        }