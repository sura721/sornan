// ====================================================================
// TEMPORARY COMBINED UPLOAD MIDDLEWARE FOR DEBUGGING
// ====================================================================

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// --- Part 1: The logic from cloudinary.ts ---

dotenv.config();

// Configure Cloudinary with your credentials from the .env file
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Create a new storage engine for Multer
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'keafa_tilef_images',
    allowedFormats: ['jpeg', 'png', 'jpg'],
  } as { folder: string, allowedFormats: string[] },
});
 

// --- Part 2: The logic from upload.middleware.ts ---

// Configure Multer to use the Cloudinary storage engine we just created above.
const upload = multer({ 
  storage: cloudinaryStorage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

export default upload;