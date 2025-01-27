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
    const videoResponse = await cloudinaryInfo(videoFile.public_id)


    // console.log("response is = " , videoFile.b)
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
    console.log("here")
    const { page = 1, limit = 9, owner, videoId ,q, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    console.log("QUERY = " , req.query)
    const sortOrder = sortType === 'asc' ? 1 : -1;
    // console.log("owner = " , owner)

    const query = {};
    if(q){
        const searchQuery = q.replace(/ /g, "+");
        const regexPattern = `(${searchQuery.replace(/\+/g, "|")})`;
        console.log("generated regx patt ", regexPattern)
        query.title = { $regex: new RegExp(regexPattern) , $options: "i"}
    }
    if (owner) {
        query.owner = owner; 
      }
    if(videoId){
        console.log("here 2" , videoId)
        query._id = {$ne : videoId}
    }
   
    const videos = await Video
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

    // console.log("Videos gye = ", videos);
    //    console.log(" id= " , id );

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
//    console.log("video id here 3 " , videoId)
    if (!videoId) throw new ApiError(404, "No Video Id found");

    const videoFile = await Video.findById(videoId)
    if (!videoFile) {
        throw new ApiError(404, "No Video found with the given id");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, videoFile, "Video Extracted successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    if (!videoId) throw new ApiError(404, "Video Id not found");


    if ((!thumbnailLocalPath) && (!title && !description)) {
        throw new ApiError(404, "Nothing to update")
    }
    const prevVideo = await Video.findById(videoId);

    if (!prevVideo) throw new ApiError(404, "No Video found with the given id")

    if (prevVideo.owner != req.user) {
        throw new ApiError(401, "You can only update your videos")
    }

    const videoFile = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || prevVideo.title,
                description: description || prevVideo.description,
            },

        },
        {
            new: true
        }
    ).select("-views ")

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video Details Updated successfully"))


})

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) throw new ApiError(404, "No video id found")

    const thumbnailLocalPath = req.file?.path
    let thumbnailurl = "";

    if (!thumbnailLocalPath) {
        throw new ApiError(404, "thumbnail is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) throw new ApiError(500, "Error while updating thumbnail on cloudinary")
    //     else{
    //       console.log("Uploaded successfully")
    //       await deletefromCloudinary(thumbnail.url)
    // }

    thumbnailurl = thumbnail.url


    const prevVideo = await Video.findById(videoId);
    const prevurl = prevVideo.thumbnail


    if (!prevVideo) throw new ApiError(404, "No Video found with the given id")



    console.log("owner", prevVideo.owner.toString())
    console.log("current user", req.user._id.toString())

    if (prevVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "You can only update your videos")
    }

    const videoFile = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnailurl || prevVideo.videoFile
            },

        },
        {
            new: true
        }
    ).select("-views ")

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video Details Updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(404, "VideoId not found")

    const prevVideo = await Video.findById(videoId)

    if (prevVideo.owner.toString() !== req.user._id.toString()) throw new ApiError(401, "Cannot Delete kisi aur kaa video")

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deleteVideo) throw new ApiError(404, "No Video found with the given id")

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const getVideoDetails = asyncHandler(async(req,res) => {
    
    let {videoId} = req.params
    if(!videoId) throw new ApiError(404 , "No VideoId found")

    videoId = new mongoose.Types.ObjectId(videoId)
    
    
    
    const video = await Video.aggregate([
        {
            $match : {
                _id: videoId
            }
        }, 
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likers"
            }
        },
        {
            $addFields:{
                likesCount : {
                    $size: "$likers"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likers.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                time : 1,
                views: 1,
                isPublished: 1,
                owner: 1,
                isLiked: 1,
                likesCount: 1,
                createdAt: 1,
            }
        }
    ])
    if (!video?.length) {
        throw new ApiError(404, "No such video found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "videoDetails fetched successfully "))

})
export { publishVideo, getAllVideos, getVideoById, updateVideo, updateVideoThumbnail, deleteVideo , getVideoDetails}