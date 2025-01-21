import { Router } from "express";
import { 
  registerUser , 
  loginUser,
   logoutUser , 
   refreshAccessToken , 
   changeCurrentPassword,
    getCurrentUser,
     updateAccountDetails, 
     updateUserAvatar, 
     updateUserCoverImage, 
     getUserChannelProfile,
     getWatchHistory,
     getUserById,
     signupWithGoogle
    } 
    from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

console.log("in rous")
const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
      ])
      ,
    registerUser
)
userRouter.route("/auth/google").get(
  signupWithGoogle
)

userRouter.route("/login").post(
  loginUser
)

// console.log("env ;" , process.env.ACCESS_TOKEN_SECRET)


//secured routes

userRouter.route("/logout").get(
  verifyJWT,
  logoutUser
)
userRouter.route("/refresh-token").post(
  refreshAccessToken
)
userRouter.route("/change-password").post(
  verifyJWT , 
  changeCurrentPassword
)
userRouter.route("/current-user").get(
  verifyJWT, getCurrentUser
)
// why patch
userRouter.route("/update-account").patch(
  verifyJWT , updateAccountDetails
)
userRouter.route("/:id").get(
  verifyJWT , getUserById
)

userRouter.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)

userRouter.route("/coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage )

userRouter.route("/c/:username").get(
  verifyJWT , getUserChannelProfile
)
userRouter.route("/history").get(verifyJWT , getWatchHistory)


export default userRouter