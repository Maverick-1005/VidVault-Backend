import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const subscribe = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    console.log("channelId" , channelId)

    if (!channelId) throw new ApiError(404, "No ChannelId found")


   const alreadySubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId
   })

   if(alreadySubscribed) throw new ApiError(403 , "already Subscribed")
    const subs = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, subs, "Subscription added"));

})

const unsubscribe = asyncHandler(async(req , res) => {
    const { channelId } = req.params

    if (!channelId) throw new ApiError(404, "No ChannelId found")
    
    const unsubs = await Subscription.deleteOne({
        subscriber : req.user?._id,
        channel : channelId
    })
    return res
        .status(200)
        .json(new ApiResponse(200, unsubs, "Subscription removed"));
})

export {subscribe , unsubscribe}