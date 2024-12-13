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
        unique: true,
        lowercase: true , 
        trim : true,
        index: true
    },
    avatar: {
        type: String , // cloudinary URL
        required: true,
    },
    coverImage: {
        type: String , // cloudinary URL
        required: true,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true , 'Password is required']
    },
    refreshToken:{
        type: String,

    }
    

},{timestamps: true})

// in arrow function we dont have context of this
userSchema.pre("save" , async function (next) {
    if(! this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password , 10) // hashrounds
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
   return  await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username ,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username ,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User" , userSchema)