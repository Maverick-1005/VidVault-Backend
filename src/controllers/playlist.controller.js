import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlists.model.js";
import mongoose from "mongoose";



const createNewPlaylist = asyncHandler(async(req , res) => {

    const {playlistName , isPublic , videoId , thumbnail , description } = req.body;
    console.log("ye aaya" , playlistName)
    console.log("ye aaya" , isPublic)
    console.log("ye aaya" , videoId)
    console.log("ye aaya" , description)
    console.log("ye aaya " , thumbnail)

    if(!videoId ) throw new ApiError(403 , "VideoId is missing")

    const createdPlaylist = await Playlist.create({
        name: playlistName,
        description: description,
        owner: req.user?._id,
        isPublic: isPublic,
        videos: [videoId],
        thumbnail: thumbnail 
    })
    if(!createdPlaylist) throw new ApiError(500 , "Server Err while creating playlist")
    return res.status(200).json(new ApiResponse(200 , "Playlist created sucessfully"))
    
})

const getAllPlaylists = asyncHandler(async(req,res) => {

    const {userId} = req.params;
    const uId = new mongoose.Types.ObjectId(userId)
    const playlists = await Playlist.find({
        owner: uId
    })
    // console.log("playlists " , playlists)
    return res.status(200).json(new ApiResponse(200 , playlists, "All Playlists fetched"))

})

const getPlaylistsById = asyncHandler(async(req,res) => {

    const {playlistId} = req.params
    if(!playlistId) throw new ApiError(404 , "No playlist id found")

    const id = new mongoose.Types.ObjectId(playlistId)
    if(!id) throw new ApiError(500 , "While converting playlistId to object")


    const playlist = await Playlist.findById(id).populate("videos owner")

    if(!playlist) throw new ApiError(404 , "No playlist found with the given id")
    
    return res.status(200).json(new ApiResponse(200 ,playlist, "playlist fetched"))
})

const addVideoToPlaylist = asyncHandler(async(req,res)=> {
    const {playlistId , videoId} = req.body
    console.log(req.body)

    if(!playlistId) throw new ApiError(404 , "Playlist Id not found")
    if(!videoId) throw new ApiError(404 , "video Id not found")

    const playlist = await Playlist.findByIdAndUpdate(playlistId ,
        {
            $addToSet : { videos : videoId}
        },
        {
            new: true
        }
     )
    if(!playlist) throw new ApiError(500 , "Server error while adding video in playlist")
    return res.status(200).json(new ApiResponse(200 , playlist , "Video added in plt"))

})

const deleteVideoFromPlaylist = asyncHandler(async(req,res) => {

    const {playlistId , videoId} = req.body
    if(!playlistId) throw new ApiError(404 , "Playlist Id not found")
        if(!videoId) throw new ApiError(404 , "video Id not found")
    
        const playlist = await Playlist.findByIdAndUpdate(playlistId , 
            {
                $pullAll : { videos : videoId}
            },
            {
                new: true
            }
         )
        if(!playlist) throw new ApiError(500 , "Server error while removing video from playlist")
        return res.status(200).json(new ApiResponse(200 , playlist , "Video removed from plt"))
    


})
export {
    createNewPlaylist,
    getAllPlaylists,
    addVideoToPlaylist,
    deleteVideoFromPlaylist,
    getPlaylistsById
}