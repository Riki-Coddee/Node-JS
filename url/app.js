import { readFile, writeFile } from "fs/promises";
import {createServer} from "http";
import path from "path";
import crypto from "crypto";
import { json } from "stream/consumers";
import { log } from "console";
const PORT = 3002;
const serverFile = async (res, pathName, content)=>{
    try {
        const data = await readFile(pathName);
        res.writeHead(200,{ "Content-Type" : content} );
        res.end(data);
    } catch (error) {
        res.writeHead(404,{ "Content-Type" : "text/plain"} );
        res.end("404 Page not found");
    }
}
const DATA_FILE= path.join("url", "links.json") 
const loadLinks = async()=>{
try {
    const data = await readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
} catch (error) {
    if(error.code === 'ENOENT'){
      await writeFile(DATA_FILE, JSON.stringify({}), { encoding: "utf-8" });
      return {};         
    }
    throw error;
}
}
const savelinks = async(links)=>{
    await writeFile(DATA_FILE, JSON.stringify(links),{ encoding: "utf-8" });
}
const server = createServer(async(req, res)=>{
    if (req.method === "GET") {
        if (req.url === "/"){
           return serverFile(res, path.join("url", "index.html"), "text/html");
        }
        else if(req.url === "/style.css"){
                return serverFile(res, path.join("url", "style.css"), "text/css");
        }
        else if(req.url === "/links"){
            const links = await loadLinks();
            res.writeHead(200, {"Content-Type" : "application/json"});
            return res.end(JSON.stringify({links}));
            console.log(links);
        }
        else{
            const link = await loadLinks();
            const shortCode = req.url.slice(1);
            if (link[shortCode]) {
                res.writeHead(302,{location: link[shortCode]});
                return res.end();
            }
            res.writeHead(404, {"Content-Type":"text/plain"});
            return res.end("Shortened URL not found.");
        }
    }

    if(req.method==="POST" && req.url==="/shorten"){
        const links = await loadLinks();

        let body = "";
        req.on("data",(chunk)=>{
          body += chunk;
        })
        req.on('end',async () => {
            console.log(body);
            const {url, shortCode} = JSON.parse(body);
            if(!url){
                res.writeHead(400,{"Content-Type": "text/html"});
                return res.end("URL s required.");
            }
            const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

            if(links[finalShortCode]){
                res.writeHead(400,{"Content-Type": "text/html"});
                return res.end("Short Code already Exists. Please Choose Another");
            }
            links[finalShortCode] = url;

            await savelinks(links);
            res.writeHead(200,{"Content-Type": "application/json"});
                return res.end(JSON.stringify({success:true, shortCode:finalShortCode}));
    })
    }
})


server.listen(PORT, ()=>{
    console.log("Listening on Port ",PORT);
    
})