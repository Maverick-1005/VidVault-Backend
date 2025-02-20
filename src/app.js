import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import multer from 'multer';

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));  // Explore more options in Documentation
app.use(express.json({
    limit: "16kb"   // some codebases have body parser for this
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

// const upload = multer();
// app.use(upload.none()); // Add this middleware to parse form-data


// routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
// import likeRouter from "./routes/like.routes.js";

// routes declaration

app.use("/api/v1/users" , userRouter)
app.use("/api/v1/video" , videoRouter)
app.use("/api/v1/comments" ,  commentRouter)
app.use("/api/v1/subs" ,  subscriptionRouter)
app.use("/api/v1/likes" ,  likeRouter)
app.use("/api/v1/playlists" ,  playlistRouter)
export {app}