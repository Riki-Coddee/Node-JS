const fs = require("fs");
const path = require("path");

const fileName = "text.txt";
const filePath = path.join(__dirname, fileName);

fs.writeFile(fileName, "This is the initial data.", "utf-8",
    (err)=>{
       if(err) console.log(err);
       else console.log("File Had Been Saved");
       
})
fs.readFile(fileName, "utf-8",
    (err, data)=>{
       if(err) console.log(err);
       else console.log(data);
       
})
fs.appendFile(fileName, "\n This is the initial data2.", "utf-8",
    (err)=>{
       if(err) console.log(err);
       else console.log("File Had Been Updated");
       
})
fs.unlink(filePath, (err)=>{
    if(err) console.log(err);
    else console.log("File has been deleted.");
});