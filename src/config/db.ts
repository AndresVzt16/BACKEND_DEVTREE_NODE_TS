import mongoose from "mongoose";
import dotenv from "dotenv";


export const connectDB = async () => {
    dotenv.config();
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Database connected successfully", mongoose.connection.host);
    } catch (error) {
        console.error("Database connection failed", error);
    }
}