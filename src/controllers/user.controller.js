import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const generateAccessAndRefreshToken = async(userId) => {
    try{
     const user =  await User.findById(userId);
     const accessToken =  user.generateAccessToken();
     const refreshToken =  user.generateRefreshToken();

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})

     return { accessToken , refreshToken}
    }
    catch{
        throw new ApiError(500 , "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async(req , res) => {
    
    const {fullName , email , username , password} = req.body
    console.log("email: " , email);

    // if(fullName === ""){
    //    throw new ApiError(400 , "FullName is required")
    // }

    // ADVANCED :)
    if(
        [fullName , email , username , password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400 , "All Fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username } , { email }]
    })
    if(existedUser){
        throw new ApiError(409 , "User with email or username already exists");

    }
    // first property has object .path gives path
    // console.log(req.files);
    console.log("Hello" , req.body);
 
   const avatarLocalPath = req.files?.avatar[0].path

   let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

   if(!avatarLocalPath){
    throw new ApiError(400 , "Avatar Files is required")
   }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  
  if(!avatar){
    throw new ApiError(400 , "Avatar Files is required")
   }

  const user =  await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
   })
   
   const createdUser  = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   
   if(!createdUser){
    throw new ApiError(500 , "Something went wrong while registering the user")
   }

   return res.status(201).json((
    new ApiResponse(200, createdUser , "User registered successfully")
   ))
    
})



const loginUser = asyncHandler(async(req , res) => {
   
    const {email , username , password} = req.body

    if(!username && !email){
        throw new ApiError(400 , "Username or email is required");
    }
   const existingUser = await User.findOne({
        $or : [ {username} , {email}]
    })
    if(!existingUser){
        throw new ApiError(404 , "User does not exist");
    }
   const isPasswordValid =  await existingUser.isPasswordCorrect(password)

   if(!isPasswordValid) throw new ApiError(401 , "Password is incorrect");

   const {accessToken  , refreshToken} =  await generateAccessAndRefreshToken(existingUser._id)

   const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

   const options = {
    httpOnly: true,
    secure: true, // only modifiable by server

   }


   return res
   .status(200)
   .cookie("accessToken" ,accessToken, options)
   .cookie("refreshToken" , refreshToken , options)
   .json(
    new ApiResponse(
        200 ,
        {
            user: loggedInUser ,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
    )
   )

})

const logoutUser = asyncHandler(async(req ,res ) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        } , 
        {
            new : true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken" , options) 
    .json(new ApiResponse(200 , {} , "User Logged Out Successfully"))
})

export {registerUser , loginUser , logoutUser}


/* ------> For Register User <------ */

    // get user details from frontend
    // validation all possible (not-empty)
    // check if user already exists username , email
    // check for images , check for avatar
    // upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response else send error


    /* ------> For Login User <------ */

    //get username and password from fronten acces from req.body
    // validate data (empty or not)
    // find the user
    // find the password
    // access and refresh token
    // send cookie
    // send res successfully login