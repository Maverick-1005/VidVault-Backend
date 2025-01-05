import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { publishVideo , getAllVideos} from "../controllers/video.controller.js";

const videoRouter = Router()

videoRouter.route("/video-upload").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
      ]),
    publishVideo
)
videoRouter.route("/video-home").get(
    verifyJWT,
    getAllVideos
)
export default videoRouter