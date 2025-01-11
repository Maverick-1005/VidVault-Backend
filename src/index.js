import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
console.log("Hello")
dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.on("error" , (err) => {
        console.log("Error: " , err);
        throw err
   })

    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server  is running at port : ${process.env.PORT}`)
    })
})
.catch( (err) => {
    console.log("Mongo Db connection failed !!!" , err)
})


// iffi
// ;( async () => {
//     try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //   app.on("error" , (err) => {
    //        console.log("Error: " , err);
    //        throw err
    //   })

//       app.listen(process.env.PORT , () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//       })
//     }
//     catch(err){
//         console.log("ERROR: " , err);
//     }
// })()