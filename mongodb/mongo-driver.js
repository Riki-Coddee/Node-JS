import { MongoClient } from 'mongodb';

async function main() {
  const client = new MongoClient("mongodb://localhost:27017/");

  try {
    await client.connect();
    const db = client.db("mongodb_nodejs_db");
    const userCollection = db.collection("user");
    //Insert
    // const result = await userCollection.insertOne({ name: "Rikesh Shrestha", age: 23 });
    // console.log("Inserted document with _id:", result.insertedId);
    
    // const result = await userCollection.insertMany(
    //     [{ name: "Rikesh Shrestha", age: 23, role:"student"},
    //     { name: "Bipin Shrestha", age: 24, role:"actor"},
    //     { name: "Saugat Shrestha", age: 25, role:"teacher"},
    //     { name: "Dayahang Shrestha", age: 26, role:"officer"},
    //     { name: "Nischal Shrestha", age: 27, role:"director"}]);

    // Read
    // const result = await userCollection.find().toArray();
    // console.log(result);
    
    // const result2 = await userCollection.findOne({name:"Rikesh Shrestha"});
    // console.log(result2);

    //Insert
    // await userCollection.updateOne({name : "Rikesh Shrestha"}, {$set:{age : 22}});

    //Delete
    // await userCollection.deleteOne({name: "Rikesh Shrestha"});
    
    const result = await userCollection.deleteMany({name: "Nischal Shrestha"});
    console.log(`${result.deletedCount} documents deleted.`);
    

  } catch (err) {
    console.error("Failed to connect or insert document:", err);
  } finally {
    await client.close();
  }
}

main();
