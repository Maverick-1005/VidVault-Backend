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

const getAllSubscribedChannels = asyncHandler(async(req , res) => {

    // const channels = await Subscription.find({
    //     subscriber: req.user?._id
    // })
    // .populate('channel')

   

    const channels = await Subscription.aggregate([
        {
          // Match subscriptions where the current user is the subscriber
          $match: {
            subscriber: req.user?._id, // Ensure this matches the subscriber field
          },
        },
        {
          // Lookup details of the subscribed channels from the "users" collection
          $lookup: {
            from: "users", // Assuming channels are stored in the "users" collection
            localField: "channel",
            foreignField: "_id",
            as: "subscribedChannelDetails",
          },
        },
        {
          // Lookup all subscriptions where the channel is the subscriber
          $lookup: {
            from: "subscriptions", // Subscriptions collection
            localField: "channel",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
          // Add computed fields for subscribersCount and isSubscribed
          $addFields: {
            subscribersCount: {
              $size: "$subscribers", // Count the number of subscribers for each channel
            },
            isSubscribed: {
              $cond: {
                if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // Check if the current user is subscribed
                then: true,
                else: false,
              },
            },
          },
        },
        {
          // Unwind the subscribed channel details to simplify the output
          $unwind: "$subscribedChannelDetails",
        },
        {
          // Project the required fields for the response
          $project: {
            _id: "$channel", // Channel ID
            fullName: "$subscribedChannelDetails.fullName", // Replace with the actual field in the users collection
            username: "$subscribedChannelDetails.username", // Replace with the actual field in the users collection
            avatar: "$subscribedChannelDetails.avatar", // Replace with the actual field in the users collection
            subscribersCount: 1,
            isSubscribed: 1,
          },
        },
      ]);

    if(!channels.length) throw new ApiError(404 , "No Subscribed Channels found")

    return res.status(200).json(new ApiResponse(200 , channels ,"subscribed channels"))
})


export {subscribe , unsubscribe , getAllSubscribedChannels}