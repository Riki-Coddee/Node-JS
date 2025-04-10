const fs = require("fs");
const path = require("path");

//Write File
const fileName = 'test.txt';
const filePath = path.join(__dirname,fileName);

const writeFile = fs.writeFileSync(filePath, "This is the initial data", "utf-8");
console.log(writeFile);

//Read File
const readLine = fs.readFileSync(filePath, "utf-8");
console.log(readLine);

//Update File
const appendFile = fs.appendFileSync(filePath,"\n This is the upadated data", "utf-8");
console.log(appendFile);

// Delete File
const deleteFile = fs.unlinkSync(filePath);
console.log(deleteFile);
