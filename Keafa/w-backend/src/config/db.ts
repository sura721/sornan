import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDB = async () => {
  // Retrieve the MongoDB connection string from environment variables.
  const mongoURI = process.env.MONGO_URI;

 
  if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
    process.exit(1);
  }

  try {
    // Attempt to connect to the MongoDB database.
    await mongoose.connect(mongoURI);

    // Log a success message to the console upon a successful connection.
    console.log("MongoDB Connected Successfully...");
  } catch (error) {
    // If an error occurs during connection, log the error and exit.
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;