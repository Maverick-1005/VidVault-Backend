import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        // file has been uploaded successfully
        // console.log("File is uploaded on Cloudinary" , response.url)

        return response;
        // print repsonse to study 
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary files as the upload operation got failed
        return null
    }
}
const cloudinaryInfo = async (videoPublicId) => {
    const cloudinaryInfo = async (videoPublicId) => {
        try {
            const result = await cloudinary.uploader.info(videoPublicId);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };
}

const deletefromCloudinary = async (url) => {
    try {
        // Extract the public ID from the URL
        const urlParts = url.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1]; // e.g., sample-image.jpg
        const publicId = publicIdWithExtension.split('.')[0]; // Remove file extension
    
        // Delete the file using the public ID
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted successfully:', result);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
}

export { uploadOnCloudinary , cloudinaryInfo , deletefromCloudinary}