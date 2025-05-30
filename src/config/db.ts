import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoDB } from "../utils/constants";
dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(MongoDB.SUCCESS);
    } catch (error) {
        console.error(MongoDB.ERROR);
        throw error;
    }
};

export default connectDB;