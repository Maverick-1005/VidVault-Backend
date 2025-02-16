import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { publishVideo , getAllVideos , getVideoById , updateVideo, updateVideoThumbnail , deleteVideo, getVideoDetails} from "../controllers/video.controller.js";

const videoRouter = Router()

videoRouter.route("/video-upload").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
      ]),
    publishVideo
)

videoRouter.route("/allVideos").get(
    getAllVideos
)
videoRouter.route("/details/:videoId").get(
    verifyJWT,
    getVideoDetails
)

videoRouter.route("/v/:videoId").get(
    verifyJWT,
    getVideoById 
)
videoRouter.route("/v-update/:id").get(
    verifyJWT,
    updateVideo
)
videoRouter.route("/video-thumbnail/:videoId").patch(
    verifyJWT , 
    upload.single("thumbnail") ,  
    updateVideoThumbnail
)
videoRouter.route("/video-delete/:videoId").patch(
    verifyJWT , 
    deleteVideo
)

export default videoRouter