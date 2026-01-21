import mongoose from "mongoose";
import { generateUIID } from "../helpers";
export interface IUser {
  name: string;
  email: string;
  password: string;
  description: string;
  handle: string;
  token:string;
  confirmed:boolean;
}
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description:{
      type:String,
      default:''
    },
    confirmed:{
      type:Boolean,
      default:false
    },
    token:{
      type: String,
      default:null
    }
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
