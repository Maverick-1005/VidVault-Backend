import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createNewPlaylist, getAllPlaylists, getPlaylistsById } from "../controllers/playlist.controller.js";

const playlistRouter = Router()


playlistRouter.route("/new").post(
    verifyJWT,
    createNewPlaylist
)
playlistRouter.route("/allPlaylists/:userId").get(
    verifyJWT,
    getAllPlaylists
)
playlistRouter.route("/addtoPlaylists").post(
    verifyJWT,
    addVideoToPlaylist
)
playlistRouter.route("/deleteFromPlaylists").post(
    verifyJWT,
    addVideoToPlaylist
)
playlistRouter.route("/byId/:playlistId").get(
    verifyJWT , 
    getPlaylistsById
)

export default playlistRouter