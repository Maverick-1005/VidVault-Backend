import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllLikedVideos, toggleLikeOnComment, toggleLikeOnVideo } from "../controllers/like.controller.js";


const likeRouter = Router()

likeRouter.route("/video/:videoId").post(
    verifyJWT , toggleLikeOnVideo
)

likeRouter.route("/comment/:commentId").post(
    verifyJWT , toggleLikeOnComment
)
likeRouter.route("/likedVideos").get(
    verifyJWT , getAllLikedVideos
)

export default likeRouter