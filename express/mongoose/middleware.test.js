import mongoose from "mongoose";
// Step 1: Connect to the mongodb server
try{
await mongoose.connect("mongodb://localhost:27017/mongodb_nodejs_db");
mongoose.set('debug', true);
}
catch(error){
    console.error(error);
    process.exit();
}

// Step 2:Create a Schema
const EmployeeSchema= mongoose.Schema({
    name: {type: String, required:true},
    email:{type: String, required:true, unique:true},
    age:{type:Number, required:true, min:5},
    createdAt:{type: Date, default: Date.now()},
    updatedAt:{type: Date, default: Date.now()},
})

// Step3: Create a middleware, should be always after the schema and before the model
EmployeeSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function (next) {
    this.set({updatedAt: Date.now()});
    next();
})

// Step4: Create a model
const Employers = mongoose.model('Employee', EmployeeSchema);
// await Employers.create({name:"Rikesh Shrestha", email:"rikeshshrestha9821@gmail.com", age : 30});
await Employers.updateOne({email:"rikeshshrestha9821@gmail.com"},{$set:{age:25 }});
mongoose.connection.close();