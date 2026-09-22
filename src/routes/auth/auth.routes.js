import { Router } from "express";
import bcrypt from "bcrypt";
import cloudinary from "../../config/cloudinary.config.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const auth = Router();

auth.post("/signup", async (req, res) => {
    try {
        const { password, channelName, email, phone } = req.body;
        const logo = req.files?.logoUrl;

        if (!logo) {
            return res.status(400).json({ message: "Logo image is required" });
        }

        if (!password || !channelName || !email || !phone) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log("Uploading image:", logo.tempFilePath);

        const uploadImage = await cloudinary.uploader.upload(
            logo.tempFilePath,
            {
                resource_type: "image",
                timeout: 60000
            }
        );

        console.log("Cloudinary upload complete");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            _id: new mongoose.Types.ObjectId(),
            channelName,
            email,
            phone,
            password: hashedPassword,
            logoUrl: uploadImage.secure_url,
            logoId: uploadImage.public_id
        });

        return res.status(201).json({
            message: "Success",
            user: {
                channelName: user.channelName,
                email: user.email,
                phone: user.phone,
                logoUrl: user.logoUrl,
                logoId: user.logoId
            }
        });
    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
});
auth.post("/login",async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email||!password)
        {
            return res.status(400).json({ message: "Credentials are required" });
        }
        const isUserPresent = await User.findOne({email});
        if(!isUserPresent)
        {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordSame = await bcrypt.compare(password,isUserPresent.password);
        if(!isPasswordSame)
        {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const jwtSecret = process.env.JWT_SECRET;
        const jwtToken = jwt.sign({
            _id:isUserPresent._id,
            channelName:isUserPresent.channelName,
            email:isUserPresent.email,
            phone:isUserPresent.phone,
            logoId:isUserPresent.logoId
        },jwtSecret,{
            expiresIn:'7d'
        })

        return res.status(200).json({
            message: "Success",
            user: {
                channelName: isUserPresent.channelName,
                email: isUserPresent.email,
                phone: isUserPresent.phone,
                logoUrl: isUserPresent.logoUrl,
                token:jwtToken,
                logoId: isUserPresent.logoId,
                subscribers:isUserPresent.subscribers,
                subscribedChannels:isUserPresent.subscribedChannels
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
})
export default auth;