import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import cookieParser from 'cookie-parser';

// Import our API route handlers
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/orders.routes';

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app: Express = express();

// --- MIDDLEWARE CONFIGURATION ---

// 1. CORS Configuration (This should be one of the first middleware)
//    Define the list of origins that are allowed to make requests to this server.

const allowedOrigins = [
  'http://localhost:8080',
  process.env.FRONTEND_URL
];

const corsOptions = {
  // Add the types for 'origin' and 'callback' here
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // The '!origin' allows requests from tools like Postman where origin is undefined.
    if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  credentials: true
};
// Use the cors middleware with your new options.
app.use(cors(corsOptions));

// 2. Standard Parsers
//    This middleware parses incoming JSON request bodies.
app.use(express.json());
//    This middleware parses cookies and populates req.cookies.
app.use(cookieParser());

// 3. Static File Serving
//    Serve files from the 'uploads' directory.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// --- ROUTES ---

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Keafa Design API is running successfully...');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);


// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});