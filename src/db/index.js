import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try{
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

       console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host} `)
    //    console.log(`\n Padhle bhai ${connectionInstance} `)
    
    }
    catch(err){
        console.log("MONGODB connection error ", err);
        process.exit(1);

        // READ about process.exit of node different numbers
    }
}

export default connectDB;