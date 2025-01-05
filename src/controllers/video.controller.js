import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, cloudinaryInfo } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"


const publishVideo = asyncHandler(async (req, res) => {

    const { title, description, isPublic } = req.body

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;

    if (!videoFileLocalPath) {
        throw new ApiError(401, "Video is required");
    }
    if (!thumbnailPath) {
        throw new ApiError(401, "ThumbNail is required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Video or thumbnail Upload failed")
    } else {
        console.log("Video and thumbnail uploaded successfully")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        title: title,
        thumbnail: thumbnail.url,
        description: description,
        time: 0,
        isPublished: isPublic,
        owner: req.user

    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Video uploaded successfully"));
})

const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query

    const sortOrder = sortType === 'asc' ? 1 : -1;
    const videos = await Video
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

    console.log("Videos = ", videos);
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

export { publishVideo , getAllVideos}