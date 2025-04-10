const { EventEmitter } = require("stream");

const emitter = new EventEmitter();

const eventCounts = {
    "user-login" : 0,
    "user-logout": 0,
    "user-purchase":0,
    "profile-update":0
}
emitter.on("user-login",(username)=>{
    eventCounts['user-login']++;
    console.log(username+" have been logged in.");
})
emitter.on("user-purchase",(username, product)=>{
    eventCounts['user-purchase']++;
    console.log(username+" have purchased "+product);
})
emitter.on("profile-update",(username, email)=>{
    eventCounts['profile-update']++;
    console.log(username+", You have updated your"+email);
})
emitter.on("user-logout",(username)=>{
    eventCounts['user-logout']++;
    console.log(username+" have been logged out.");
})
emitter.on("summary",()=>{
    console.log(eventCounts);
    
})
emitter.emit("user-login", "Rikesh");
emitter.emit("user-purchase", "Rikesh", "Laptop");
emitter.emit("profile-update","Rikesh", "email");
emitter.emit("user-logout", "Rikesh");
emitter.emit("summary");