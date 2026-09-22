import mongoose from "mongoose";
const userShema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  channelName: {
    type: String,
    required: true,
    trim:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim:true
  },
  phone: {
    type: String,
    required: true,
    trim:true
  },
  password:{
    type:String,
    required:true,
    trim:true
  },
  logoUrl:{
    type:String,
    required:true,
    trim:true
  },
  logoId:{
    type:String,
    trim:true,
    required:true,
  },
  subscribers:{
    type:Number,
    default:0
  },
  subscribedChannels:[{
    type:mongoose.Schema.Types.ObjectId, 
    ref:"User"
  }]
},{timestamps:true});
const User = mongoose.model("User",userShema);
export default User;
