import readline from "readline";
import fs from "fs";

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const fileCreator = ()=>{
    r1.question("Enter The File Name:",(filename)=>{
       r1.question("Enter the file content:",(content)=>{
          fs.writeFile(`${filename}.txt`, content, (err)=>{
            if(err){
                console.log("Error Creating File:");
            }
            else{
                console.log(`Your file ${filename}.txt has been created successfully.`);
                r1.close();
            }
          })
       })
    })
}
fileCreator();
