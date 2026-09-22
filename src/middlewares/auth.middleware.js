import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
const verfifyUser = async (req,res,next) => {
    try {
        const {token} = req.cookies;
        if(!token)
        {
            return res.status(401).json({
                message:"Unauthorized - login or signup"
            })
        }
        const jwtSecret = process.env.JWT_SECRET;
        const isTokenValid = await jwt.verify(token,jwtSecret);
        const {_id}= isTokenValid;
        const user = await User.findById(_id);
        if(!user)
        {
            return res.status(401).json({
                message:"Unauthorized - login or signup"
            })
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}
export default verfifyUser;