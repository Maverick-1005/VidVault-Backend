import dotenv from "dotenv"

import connectDB from "./db/index.js";


dotenv.config({
    path: './env'
})



connectDB()

// iffi
// ;( async () => {
//     try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("error" , (err) => {
//            console.log("Error: " , err);
//            throw err
//       })

//       app.listen(process.env.PORT , () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//       })
//     }
//     catch(err){
//         console.log("ERROR: " , err);
//     }
// })()