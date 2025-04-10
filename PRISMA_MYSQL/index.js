import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const main = async()=>{
    // Create(Insert Data)
        // Single User
            // const user = await prisma.user.create({
            //     data:{
            //         name : "Rikesh Shrestha",
            //         email : "rikeshshrestha9821@gmail.com"
            //     }
            // })
            // console.log(user);
         
        //  Multiple Users   
            //   const user = await prisma.user.createMany({
            //     data:[
            //         {name : "Rikesh Shrestha2", email : "rikeshshrestha982@gmail.com"},
            //         {name : "Rikesh Shrestha3", email : "rikeshshrestha98@gmail.com"},
            //         {name : "Rikesh Shrestha4", email : "rikeshshrestha9@gmail.com"},
            //       ]
            // })
            // console.log(user);

    // Find(Read Data)
        // Get ALL Users
            // const user = await prisma.user.findMany();
            // console.log(user);
         
        //  Get a single user by unique field
            //   const user = await prisma.user.findUnique({
            //          where : {id : 1},
            //               });
            // console.log(user);

        //  Get user by filtering
            //   const user = await prisma.user.findMany({
            //          where : {id : 1},
            //               });
            // console.log(user);         
            
    
    // Update (Modify Data)
        // Update One Users
            // const user = await prisma.user.update({
            //     where : {id:3}, //must have unique field
            //     data : {name:"BobTheBuilder"},
            // });
            // console.log(user);
         
        //  Update Multiple Users
            //   const user = await prisma.user.updateMany({
            //          where : {name:"Rikesh Shrestha"},
            //           data:{email:"rikeshshresthaggmu@gmail.com"}    });
            // console.log(user);                
      
    //Delete (Remove Data)
        //  Delete single user 
        // const user = await prisma.user.delete({
        //         where : {id:3}, 
        //     });
        //     console.log(user);  
            
         //Delete Multiple users
            // const user = await prisma.user.deleteMany({
            //     where : [{id:4},{id:5}], 
            // });
            // console.log(user);    
            
};
main()
.catch((e)=>{console.log(e);}
)
.finally( async()=>{
   await prisma.$disconnect();
}
)