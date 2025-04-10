// import { MongoClient } from "mongodb";
// import {env} from "./env.js";

// export const dbClient =new MongoClient(env.MONGODB_URI);

import mysql from 'mysql2/promise';
import {env} from "./env.js";

    export const db = await mysql.createConnection({
        host: env.DATABASE_HOST,
        user: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_DB,
    })