import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({

    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true , 
        trim : true,
        index: true  // to make it easy searchable
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true , 
        trim : true,
    },
    fullName: {
        type: String,
        required: true,
        trim : true,
        index: true
    },
    avatar: {
        type: String , // cloudinary URL
        required: true,
    },
    coverImage: {
        type: String , // cloudinary URL
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    bio: {
        type: String,
        default: "..."
    },
    password:{
        type: String,
        
    },
    refreshToken:{
        type: String,

    }
    

},{timestamps: true})

// in arrow function we dont have context of this
userSchema.pre("save" , async function (next) {
    if(! this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return  await bcrypt.compare(password , this.password)
}

// here user schema is a data model in which a method is invoked to generate access and refresh token

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username ,    // metadata about the user
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,    // found in the .env file
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY  // found in the .env file
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,  // refresh token generaly doesn't carry much data
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY    // found in the .env file
        }
    )
}


export const User = mongoose.model("User" , userSchema)