import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';

// Import our API route handlers
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/orders.routes';

// ====================================================================
// INITIAL SETUP
// ====================================================================

// 1. Load environment variables from the .env file into process.env
dotenv.config();

// 2. Establish connection to the MongoDB database.
//    The application will exit if the connection fails.
connectDB();

// 3. Initialize the Express application instance
const app: Express = express();

// ====================================================================
// MIDDLEWARE CONFIGURATION
// ====================================================================

// 4. Enable Cross-Origin Resource Sharing (CORS).
//    This is crucial to allow our frontend application (running on a different port)
//    to make API requests to this backend.
app.use(cors());

// 5. Enable the built-in Express JSON middleware.
//    This parses incoming requests with JSON payloads (e.g., from POST/PUT requests)
//    and makes the data available on `req.body`.
app.use(express.json());

// 6. Serve static files from the 'uploads' directory.
//    This makes any files inside the 'uploads' folder publicly accessible.
//    For example, an image at `uploads/tilefImage-123.jpg` can be accessed by the
//    frontend at `http://<backend_url>/uploads/tilefImage-123.jpg`.
//    `path.join(__dirname, '..', 'uploads')` creates a robust, absolute path.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ====================================================================
// API ROUTES
// ====================================================================

// 7. A simple root endpoint to confirm the API is running.
app.get('/', (req: Request, res: Response) => {
  res.send('Keafa Design API is running successfully...');
});

// 8. Mount the imported route handlers onto the application.
//    - Any request to a path starting with `/api/auth` will be handled by `authRoutes`.
//    - Any request to a path starting with `/api/orders` will be handled by `orderRoutes`.
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ====================================================================
// SERVER INITIALIZATION
// ====================================================================

// 9. Define the port for the server.
//    It will use the PORT variable from the .env file, or default to 5000.
const PORT = process.env.PORT || 5000;

// 10. Start the server and listen for incoming connections on the specified port.
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});