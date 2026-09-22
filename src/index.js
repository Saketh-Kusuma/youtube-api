import express from "express";
import { config } from "dotenv";
import { ConnectToDB } from "./config/db.config.js";
import auth from "./routes/auth/auth.routes.js";
import fileUpload from "express-fileupload";
import video from "./routes/videos/videos.routes.js";
import cookieParser from "cookie-parser";
import verfifyUser from "./middlewares/auth.middleware.js";
config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"./tmp"
}))
app.use("/api/v1/auth",auth);
app.use("/api/v1/video",verfifyUser,video);
ConnectToDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server Started on http://localhost:8080");
    })
}).catch((error)=>{
    console.error(error.message);
    process.exit(1);
}); 