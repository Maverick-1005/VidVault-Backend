import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
export const verifyJWT = asyncHandler(async(req, res , next) => {
 try {
   const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
 
   if(!token){
     throw new ApiError(401 , "Unauthorized request")
   }
 
   const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
   console.log("decodedToken" , decodedToken);
  const user =  await User
   .findById(decodedToken?._id)
   .select("-password -refreshToken")
   
   if(!user){ 
    console.log("OK401")
     throw new ApiError(401 , "Invalid Access Token")
   }
   console.log("OK")
   // add new object
   req.user = user;
   next();
 } catch (error) {
   throw new ApiError(401 , error?.message || "Invalid Access Token")
 }
})



// iske baad req mein ek naya object add krskta hoon req.ansh types
