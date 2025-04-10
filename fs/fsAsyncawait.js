const fs = require("fs/promises");
const path = require("path");

const fileName = "text.txt";
const filePath = path.join(__dirname, fileName);

// const filePath1 = __dirname;
// fs.readdir(__dirname)
// .then((data)=>{console.log(data);})
// .catch((err)=>{err})

// fs.writeFile(filePath, "This is the initial data", "utf-8")
// .then(console.log("File has been created."))
// .catch((err)=>{console.log(err)})

// fs.readFile(filePath,"utf-8")
// .then((data)=>{console.log(data)})
// .catch((err)=>{console.log(err)})

// fs.appendFile(filePath, "\n This is the second data2", "utf-8")
// .then(console.log("File has been updated."))
// .catch((err)=>{console.log(err)})

fs.unlink(filePath)
.then(console.log("File has been deleted."))
.catch((err)=>{console.log(err)})