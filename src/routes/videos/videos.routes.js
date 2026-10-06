import { Router } from "express";
const video = Router();
import Video from "../../models/video.model.js";
import cloudninary from "../../config/cloudinary.config.js";
import mongoose from "mongoose";

video.get("/all", async (req, res) => {
  try {
    const videos = await Video.find({});
    return res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
video.get("/all/:id", async (req, res) => {
  try {
    const videos = await Video.find({ user_id: req.params.id });
    return res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
video.post("/upload", async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    if (!title || !description || !category || !tags) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (!req.files || !req.files.video || !req.files.thumbnail) {
      return res.status(400).json({
        message: "Missing Required Files",
      });
    }
    const videoUpload = await cloudninary.uploader.upload(
      req.files.video.tempFilePath,
      {
        resource_type: "video",
        folder: "videos",
      },
    );
    const thumbnailUpload = await cloudninary.uploader.upload(
      req.files.thumbnail.tempFilePath,
      {
        folder: "thumbnails",
      },
    );
    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      category,
      user_id: req.user._id,
      videoUrl: videoUpload.secure_url,
      videoId: videoUpload.public_id,
      thumbnailUrl: thumbnailUpload.secure_url,
      thumbnailId: thumbnailUpload.public_id,
      tags: tags ? tags.split(",") : [],
    });
    await newVideo.save();
    return res
      .status(201)
      .json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});
video.put("/update/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        error: "videos not found",
      });
    }
    console.log(req.user._id.toString());
    if (video.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "unauthorized" });
    }
    const updatedData = {};
    const { title, description, category, tags } = req.body || {};
    if (title != undefined) updatedData.title = title;
    if (description != undefined) updatedData.description = description;
    if (category != undefined) updatedData.category = category;
    if (tags != undefined) updatedData.tags = tags.split(",");
    if (req.files) {
      const upload = await cloudninary.uploader.upload(
        req.files.thumbnail.tempFilePath,
        {
          folder: "thumbnails",
        },
      );
      if (video.thumbnailId) {
        await cloudninary.uploader.destroy(video.thumbnailId);
      }
      ((updatedData.thumbnailUrl = upload.secure_url),
        (updatedData.thumbnailId = upload.public_id));
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        message: "No fields provided for update",
      });
    }
    const updateVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { returnDocument: "after", runValidators: true },
    );
    return res.status(200).json({
      message: "Video metadata updated successfully",
      video: updateVideo,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});
video.put("/like/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        error: "videos not found",
      });
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          dislikedBy: req.user._id,
        },
        $addToSet: {
          likedBy: req.user._id.toString(),
        },
      },
      { returnDocument: "after", runValidators: true },
    );
    return res.status(200).json({
      success: true,
      video: updatedVideo,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});
video.put("/dislike/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: "no video found" });
    }
    const updateVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          likedBy: req.user._id,
        },
        $addToSet: {
          dislikedBy: req.user._id,
        },
      },
      { returnDocument: "after", runValidators: true },
    );
    return res.status(200).json({
      success: true,
      video: updateVideo,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
export default video;
