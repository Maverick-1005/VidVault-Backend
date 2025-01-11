import { Router} from "express";
import {addComment, deleteComment, getAllComments, updateComment} from '../controllers/comment.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const commentRouter = Router()

commentRouter.route('/allcomments').get(
  getAllComments 
)

commentRouter.route('/add-comment/:videoId').post(
  verifyJWT,
  addComment
)
commentRouter.route('/delete-comment/:videoId').post(
  verifyJWT,
  deleteComment
)
commentRouter.route('/update-comment/:commentId').post(
  verifyJWT,
  updateComment
)

export default commentRouter