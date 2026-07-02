
import mongoose, {Schema,Document} from "mongoose";
import { generateUIID } from "../helpers";
export interface IUser extends Document{
  name: string;
  email: string;
  password: string;
  description: string;
  location:string;
  handle: string;
  token:string;
  confirmed:boolean;
  image:string,
  imageId:string,
  links:String,
  tags:String
}
const userSchema = new Schema(
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
    location:{
      type:String,
      
      trim:true
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
    },
    image:{
      type:String,
      default:''
    },
    imageId:{
      type:String,
      default:''
    },
    links:{
      type:String,
      default:'[]'
    },
    tags:{
      type:String,
      default:'[]'
    }
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
