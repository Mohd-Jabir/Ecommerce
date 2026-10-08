import mongoose from "mongoose";
let isConnected = false;
export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    isConnected = connection.connection.readyState === 1;
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};