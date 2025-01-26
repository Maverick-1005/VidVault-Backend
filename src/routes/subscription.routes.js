import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { subscribe, unsubscribe } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router()

subscriptionRouter.route("/subsribe/:channelId").get(
    verifyJWT , subscribe
)
subscriptionRouter.route("/unsubsribe/:channelId").get(
    verifyJWT , unsubscribe
)

export default subscriptionRouter;