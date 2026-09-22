import { Router } from "express";
const video = Router();
import Video from "../../models/video.model.js"
import cloudninary from "../../config/cloudinary.config.js";
import mongoose from "mongoose";

video.post("/upload", async (req,res)=>{
 try {
    const {title,description,category,tags} = req.body;
    if(!req.files || !req.files.video || !req.files.thumbnail)
    {
        return res.json(400).json({
            message:"Missing Required Files"
        })
    }
    const videoUpload = await cloudninary.uploader.upload(req.files.video.tempFilePath,{
        resource_type:"video",
        folder:"videos"
    })
       const thumbnailUpload = await cloudninary.uploader.upload(req.files.thumbnail.tempFilePath,{
        folder:"thumbnails"
    })
    const newVideo = new Video({
        _id: new mongoose.Types.ObjectId,
        title,
        description,
        category,
        user_id:req.user._id,
        videoUrl:videoUpload.secure_url,
        videoId:videoUpload.public_id,
        thumbnailUrl:thumbnailUpload.secure_url,
        thumbnailId:thumbnailUpload.public_id,
        tags:tags?tags.split(","):[],
    })
    await newVideo.save();
    return res.status(201).json({message:"Video uploaded successfully",video:newVideo});
 } catch (error) {
    return res.status(400).json({
        error:error.message
    })
 }
})
export default video;