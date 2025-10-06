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
if (!process.env.FRONTEND_URL) {
  console.warn('WARNING: FRONTEND_URL environment variable not set. CORS may block requests from the frontend.');
}
// -
// Allow common dev origins (Vite, localhost) plus any FRONTEND_URL provided in env
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: The origin '${origin}' was blocked.`);
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  credentials: true,
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

if (process.env.RENDER || process.env.NODE_ENV === 'production') {
  const axios = require('axios');

  const URL = `${process.env.FRONTEND_URL}/health` || `https://sornan-orders.vercel.app/health`;

  setInterval(async () => {
    try {
      await axios.get(URL);
      console.log('💓 Health ping sent successfully to:', URL);
    } catch (error) {
      console.error('❌ Health ping failed:', (error as any).message);
    }
  }, 5 * 60 * 1000); // every 5 minutes
}
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