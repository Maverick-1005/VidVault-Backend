import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comments.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getAllComments = asyncHandler(async(req , res) => {
    
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'newest', videoId} = req.query

    const sortOrder = sortType === 'asc' ? 1 : -1;

    const comments = await Comment
        .find({
            video : videoId
        })
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);
    console.log("Comments = ", comments);
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
})
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body
    const { videoId } = req.params

    if (!videoId) throw new ApiError(404, "VideoID not found")
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404, "No Video found with the given Id")


    if (!text) throw new ApiError(404, "Comment content not found")

    const comment = await Comment.create({
        content: text,
        video: video,
        owner: req.user,
    })
    if (!comment) throw new ApiError(500, "Error while creating comment from server")

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) throw new ApiError(d404, "Comment Id not found")

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) throw new ApiError(404, "Comment not found")
    res.status(200).json(new ApiResponse(200, comment, "Comment Deleted successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { text } = req.body
    const { commentId } = req.params

    if (!commentId) throw new ApiError(d404, "Comment Id not found")

    if (!text) throw new ApiError(404, "No text found")

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content: text
            }
        }
    )

    console.log("cmmt: ", comment.content)
    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"))
})
export { addComment, deleteComment, updateComment , getAllComments}
