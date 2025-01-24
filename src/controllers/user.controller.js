import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { oauth2client } from '../utils/googleConfig.js'
import axios from "axios";
import { google } from "googleapis";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        console.log("Heelo", user);

        const accessToken = user.generateAccessToken();
        console.log("Heelo");

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body
    console.log("email: ", email);

    // if(fullName === ""){
    //    throw new ApiError(400 , "FullName is required")
    // }

    // ADVANCED :)
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");

    }
    // first property has object .path gives path
    console.log(req.files);
    console.log("Hello", req.body);

    const avatarLocalPath = req.files?.avatar[0].path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Files is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar Files is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json((
        new ApiResponse(200, createdUser, "User registered successfully")
    ))

})

const signupWithGoogle = asyncHandler(async (req, res) => {
    const { code } = req.query
   if(code) console.log("ye aaya code " , code)

    google.options({ auth: oauth2client });  

    const googleRes = await oauth2client.getToken(code)
    oauth2client.setCredentials(googleRes.tokens);

    let email, name, picture

    await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
        .then((res) => {
            email = res.data.email
            name = res.data.name
            picture = res.data.picture
            console.log("res = ", res.data)

        })
        .catch((err) => {
            console.log("err", err)
        })

    console.log("email is ", email)
    const existingUser = await User.findOne({ email: email })
    console.log("existing user", existingUser)

    if (existingUser) {

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id)

        const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None"

        }

        console.log("user  hai", loggedInUser)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged in successfully"
                )
            )

    }

    let temp = email.split("@");
    const username = temp[0];

    const user = await User.create({
        fullName: name,
        avatar: picture,
        coverImage: "",
        email,
        password: "",
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"

    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(createdUser._id)


    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json((
            new ApiResponse(200, createdUser, "User registered successfully")
        ))


})



const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body
    console.log("hg", req.body)

    console.log(" email ", email);
    console.log(" un ", username);
    console.log(" pass ", password);
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!existingUser) {
        throw new ApiError(404, "User does not exist");
    }
    if (password === "") throw new ApiError(403, "Password must be of atleast 1 char")
    const isPasswordValid = await existingUser.isPasswordCorrect(password)


    if (!isPasswordValid) throw new ApiError(401, "Password is incorrect");
    console.log(" id = ", existingUser._id);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id)

    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"

    }
    console.log(" hoiga login with at: ", accessToken)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    console.log("logout here");
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined // yaha dekhlio
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized req")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "No user found with the given refresh Token")
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    // console.log("curr " , user)
    const isPasswordcorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordcorrect) {
        throw new ApiError(401, "Old Password is incorrect")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfuly"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfuly"))
})

const getUserById = asyncHandler(async (req, res) => {

    const { id } = req.params

    if (!id) throw new ApiError(404, "Id not found")
    // console.log(" id aa gyi " , id);
    const user = await User.findById(id)
    if (!user) {
        throw new ApiError(404, "No user with that Id")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfuly")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email, fullName } = req.body
    console.log(req.body)

    if (!username && (!email && !fullName)) {
        throw new ApiError(400, "Nothing to update...")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                // Yahan check krlo
                fullName: fullName || req.user.fullName,
                email: email || req.user.email,
                username: username || req.user.username
            }
        },
        {
            new: true // update hone ke baad kaa object return hota hai ye krdo to
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Account details updated successfully"))

})
//

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) throw new ApiError(400, "Avatar File is missing")

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Avatar image updated successfuly"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) throw new ApiError(400, "Cover Image File is missing")

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, user, "Error while uploading coverImage on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfuly"))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params  // from url

    if (!username?.trim()) throw new ApiError(400, "Username is missing ");

    const channel = await User.aggregate([   // yaha se array aati hai
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedChannels"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedChannelsCount: {
                    $size: "subscribedChannelsCount"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedChannelsCount: 1,
                avatar: 1,
                email: 1,
                coverImage: 1,
                isSubscribed: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "No such channel found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "userChannel fetched successfully "))


})

// console log krke dekhna channel

const getWatchHistory = asyncHandler(async (req, res) => {
    const useer = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)      // yaha mongoose apna kaam nahi krega string ko compare
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: {
                                        owner: {
                                            $first: "owner"
                                        }
                                    }
                                }
                            ]

                        }

                    }
                ]

            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched succcessfully "))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getUserById,
    signupWithGoogle
}


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


// access and refresh token
// session expire hone ke baad ek aur req bejhke token ko refresh kra leta hai