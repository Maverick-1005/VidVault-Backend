import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({

    videoFile: {
        type: String ,// cloudinary URL
        required: true,

    },
    thumbnail: {
        type: String, // cloudinary URL
        required: true
    },
    title: {
        type: String , 
        required: true
    },
    description: {
        type: String , 
        required: true
    },
    time: {
        type: Number , // duration from cloudinary 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean, 
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


},{timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate)

// now we can write aggregation queries


export const Video = mongoose.model("Video" , videoSchema)