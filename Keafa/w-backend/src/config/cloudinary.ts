import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
// Configure Cloudinary with your credentials from the .env file
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Create a new storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: {
    folder: 'keafa_tilef_images', // The name of the folder in Cloudinary where images will be stored
    allowedFormats: ['jpeg', 'png', 'jpg'],
  } as { folder: string, allowedFormats: string[] }, // Type assertion for params
});

// THIS IS THE LINE THE ERROR IS COMPLAINING ABOUT. WE MUST HAVE IT.
export default storage;