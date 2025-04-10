const http = require('http');
const server = http.createServer((req, res)=>{
    if(req.url=='/'){
        res.setHeader("Content-Type", "text/html");
    res.write("<h1>Hello From the server side. I wish I was the client side. Rikesh</h1>");
    res.end();
    }
})
const PORT = 3000;
server.listen(PORT, ()=>{
    console.log(`Listening on Port ${PORT}`);
    
})