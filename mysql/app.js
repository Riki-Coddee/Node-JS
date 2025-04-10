import mysql from 'mysql2/promise';

try {
  //1: Connect to MySQL (no specific database yet)
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'mysql_db'
  });

  console.log("Connected to MySQL successfully.");

  //2: Create a new database
    //   await connection.execute('CREATE DATABASE IF NOT EXISTS mysql_db');
    //   console.log("Database 'mysql_db' created or already exists.");

  // Show all databases
    //   const [rows] = await connection.execute('SHOW DATABASES');
    //   console.log("Databases:");
    //   console.table(rows);

    // 3: Create a table
//        await connection.execute(`Create Table users(
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(100) NOT NULL,
//         email VARCHAR(100) NOT NULL UNIQUE
//         );
//    `);

//    4 : Perform CRUD Operaion
    // INSERT
    // Not Recommended 
        //   await connection.execute(`
        //     insert into users(username, email) values('vinod', 'vinod@thapa.com');
        //     `);

    // Using Prepared Statement (Best Practice)
        // const username = 'Rikesh';
        // const email = 'rikeshshrestha9821@gmail.com';
        //     await connection.execute(`
        //         insert into users(username, email) values(?,?);`,
        //     [username, email]);
    //Insert Multiple Data
    // const values = [
    //     ['vinod2', 'vinod2@thapa.com'],
    //     ['Alice', 'alice@thapa.com'],
    //     ['bob', 'bob@thapa.com'],
    //     ['charlie', 'charlie@thapa.com'],
    //     ['hero', 'hero@thapa.com'],
    // ]
    // await connection.query(`
    //             insert into users(username, email) values ?;`,
    //         [values]);

    //Read
    //   const [rows] = await connection.execute(`
    //      SELECT * FROM users;
    //     `);
    //     console.log(rows);
        

    // Update
    // const [rows] = await connection.execute(`
    //          update users set username='rikesh hero' where email='rikeshshrestha9821@gmail.com'
    //         `);
    //         console.log(rows);


    // Delete
    const [rows] = await connection.execute(`
             delete from users where email='rikeshshrestha9821@gmail.com'
            `);
            console.log(rows);
  await connection.end();
} catch (err) {
  console.error("Error connecting to MySQL:", err);
}
