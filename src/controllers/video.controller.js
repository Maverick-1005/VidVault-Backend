import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, cloudinaryInfo, deletefromCloudinary } from "../utils/cloudinary.js"
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

const getVideoById = asyncHandler(async(req , res) => {
    const {videoId} = req.params;
    
    if(!videoId) throw new ApiError(404 , "No Video Id found");

    const videoFile = await Video.findById(videoId)
    if(!videoFile){
        throw new ApiError(404 , "No Video found with the given id");
    }
    return res
    .status(200)
    .json(new ApiResponse(200 , videoFile , "Video Extracted successfully"));
})

const updateVideo = asyncHandler(async(req , res) => {
    const {videoId} = req.params
    const {title , description } = req.body
    if(!videoId) throw new ApiError(404 , "Video Id not found");


    if((!thumbnailLocalPath) && (!title && !description)){
        throw new ApiError(404 , "Nothing to update")
    }
    const prevVideo = await Video.findById(videoId);

    if(!prevVideo) throw new ApiError(404 , "No Video found with the given id")

        if(prevVideo.owner != req.user){
            throw new ApiError(401 , "You can only update your videos" )
        }
    
    const videoFile = await Video.findByIdAndUpdate(
        videoId , 
        {
            $set: {
                title: title || prevVideo.title,
                description: description || prevVideo.description,
            },

        },
        {
            new : true
        }
    ).select("-views ")

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Video Details Updated successfully"))


})

const updateVideoThumbnail = asyncHandler(async(req , res) => {
    const {videoId} = req.params
    if(!videoId) throw new ApiError(404 , "No video id found")

    const thumbnailLocalPath = req.file?.path
    let thumbnailurl = "";

    if(!thumbnailLocalPath){
        throw new ApiError(404 , "thumbnail is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail) throw new ApiError(500 , "Error while updating thumbnail on cloudinary") 
    //     else{
    //       console.log("Uploaded successfully")
    //       await deletefromCloudinary(thumbnail.url)
    // }
        
    thumbnailurl = thumbnail.url
  
    
    const prevVideo = await Video.findById(videoId);
    const prevurl = prevVideo.thumbnail


    if(!prevVideo) throw new ApiError(404 , "No Video found with the given id")
       
        
      
        console.log("owner"  , prevVideo.owner.toString())
        console.log("current user"  , req.user._id.toString())

        if(prevVideo.owner.toString() !== req.user._id.toString()){
            throw new ApiError(401 , "You can only update your videos" )
        }
    
    const videoFile = await Video.findByIdAndUpdate(
        videoId , 
        {
            $set: {
               thumbnail: thumbnailurl || prevVideo.videoFile
            },

        },
        {
            new : true
        }
    ).select("-views ")

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Video Details Updated successfully"))


})

const deleteVideo = asyncHandler(async(req , res) => {
   const {videoId} = req.params
   
   if(!videoId) throw new ApiError(404 , "VideoId not found")
   
    const prevVideo = await Video.findById(videoId)

    if(prevVideo.owner.toString() !== req.user._id.toString()) throw new ApiError(401 , "Cannot Delete kisi aur kaa video")

   const deletedVideo = await Video.findByIdAndDelete(videoId);
   if(!deleteVideo) throw new ApiError(404 , "No Video found with the given id")
    
   return res.status(200).json(new ApiResponse(200 , {} , "Video deleted successfully"))
})
export { publishVideo , getAllVideos , getVideoById , updateVideo , updateVideoThumbnail , deleteVideo}