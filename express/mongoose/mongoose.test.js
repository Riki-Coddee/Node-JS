import mongoose from 'mongoose';
// Step 1: to connect to the mongodb server
try {
    await mongoose.connect("mongodb://localhost:27017/mongodb_nodejs_db");
    mongoose.set('debug', true);
} catch (error) {
    console.error(error);
    process.exit();
}

// Step2 : Create user Schema
const userSchema = mongoose.Schema({
    name: {type: String, required:true},
    email:{type: String, required:true, unique:true},
    age:{type:String, required:true, min:5},
    createdAt:{type: Date, default: Date.now()},

})


// Step3: Creating a model
const Users = mongoose.model("User", userSchema);
await Users.create({
    name:"Rikesh Shrestha",
    email: "rikeshshrestha9821@gmail.com",
    age: 22,
})

await mongoose.connection.close();