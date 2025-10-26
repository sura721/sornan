import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface IAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token format is incorrect.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      return res.status(500).send('Server Error');
    }

    const decoded = jwt.verify(token, jwtSecret);

    req.user = (decoded as any).user;

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Not authorized, token is invalid.' });
  }
};

export default authMiddleware;