import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables correctly (absolute path)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  console.log("Loaded Mongo URI:", mongoURI); // 🔍 debug

  if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully...");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
  