const fs = require("fs");
const path = require("path");

const fileName = "text.txt";

const filePath = path.join(__dirname, fileName);

// fs.promises.writeFile(filePath, "This is the initial data", "utf-8")
// .then(console.log("File successfully Created."))
//  .catch((err)=>console.log(err))

//  fs.promises.readFile(filePath, "utf-8")
// .then((data)=>console.log(data))
//  .catch((err)=>console.log(err))

//  fs.promises.appendFile(filePath,"\n This is the updated data", "utf-8")
//  .then(console.log( "File been successfully updated"))
//   .catch((err)=>console.log(err))
 
  fs.promises.unlink(filePath)
  .then(console.log("File been successfully deleted"))
   .catch((err)=>console.log(err))