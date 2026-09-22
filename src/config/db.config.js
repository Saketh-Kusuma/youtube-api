import mongoose from "mongoose";
export const ConnectToDB = async () => {
    try {
        const url = process.env.MONGODB_URI;
        await mongoose.connect(url);
        console.log("Database Connected 🟢");
    } catch (error) {
        console.error(error.message);
        throw new Error("Something went wrong 🔴",error);
    }
}