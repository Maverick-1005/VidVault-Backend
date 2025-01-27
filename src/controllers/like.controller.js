import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js"
import mongoose from "mongoose";

const toggleLikeOnVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { isLiked } = req.body;
    
    if (!videoId) throw new ApiError(404, "No VideoId found")
    let videoLike = null
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404 , "No Such video found")

    if (!isLiked) {
        videoLike = await Like.findOne({
            video: video._id,
            likedBy: req.user?._id
        })
        console.log("vl " , videoLike)
        if(videoLike) throw new ApiError(403 , "Video Already Liked")
        
        videoLike = await Like.create({
            video: video._id,
            likedBy: req.user?._id
        })
        if (!videoLike) throw new ApiError(500, "server err while creating videoLike")

        return res.status(200).json(new ApiResponse(200, videoLike, "VideoLike crerated successfully"))


    }
    else {
        videoLike = await Like.findOneAndDelete({
            video: video._id,
            likedBy: req.user?._id
        })
        if (!videoLike) throw new ApiError(500, "no such videoLike exists")

        return res.status(200).json(new ApiResponse(200, videoLike, "VideoUnliked successfully"))

    }



})


const toggleLikeOnComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { isLiked } = req.body;


    if (!commentId) throw new ApiError(404, "No commentId found")

    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError("No Such comment found")

    const commentLike = await Like.create({
        video: comment._id,
        likedBy: req.user?._id
    })

    if (!commentLike) throw new ApiError(500, "server err while creating videoLike")

    return res.status(200).json(new ApiResponse(200, commentLike, "commentLike crerated successfully"))

})
const toggleLikeOnTweets = asyncHandler(async (req, res) => {

})

const getAllLikedVideos = asyncHandler(async(req , res) => {
    
    const videos = await Like.aggregate([
        {
            // Match likes made by the user and ensure the 'video' field is not null
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id), // Convert to ObjectId if needed
                video: { $ne: null }, // Ensure video is not null
            },
        },
        {
            // Perform a lookup to join the 'videos' collection
            $lookup: {
                from: "videos", // The name of the videos collection
                localField: "video", // Field in the likes collection
                foreignField: "_id", // Field in the videos collection
                as: "videoDetails", // Name of the joined field
            },
        },
        {
            // Unwind the joined array to make it easier to access
            $unwind: "$videoDetails",
        },
        {
            // Project only the necessary fields
            $project: {
                _id: 0, // Exclude the _id from the 'likes' collection
                likedAt: "$createdAt", // Include the timestamp of when the like occurred
                videoId: "$videoDetails._id",
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                videoFile: "$videoDetails.videoFile",
                thumbnail: "$videoDetails.thumbnail",
                owner: "$videoDetails.owner",
                views: "$videoDetails.views",
                createdAt: "$videoDetails.createdAt",
            },
        },
    ]);
    
    if (!videos.length) {
        throw new ApiError(404, "No liked videos found");
    }
    
    res.status(200).json(new ApiResponse(200 , videos , "liked videos fetched"));
    
})


export {
    toggleLikeOnVideo,
    toggleLikeOnComment,
    toggleLikeOnTweets,
    getAllLikedVideos
}