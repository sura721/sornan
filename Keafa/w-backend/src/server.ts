import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db';
import cookieParser from 'cookie-parser';

// Import our API route handlers
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/orders.routes';

 
dotenv.config();

 
connectDB();

 const app: Express = express();
 
 app.use(cors({
  origin: 'https://sornan-orders.vercel.app',  
  credentials: true                 
}));

 
app.use(express.json());
app.use(cookieParser());
 
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
 
app.get('/', (req: Request, res: Response) => {
  res.send('Keafa Design API is running successfully...');
});
 
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
 
const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});