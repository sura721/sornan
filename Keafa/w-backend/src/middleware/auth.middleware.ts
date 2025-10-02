import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a custom interface to extend the Express Request type
// This provides type safety for req.user
interface IAuthRequest extends Request {
  user?: { // or a more specific type for your user payload
    id: string;
    username: string;
  };
}

const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the token from the cookies.
  //    The 'cookie-parser' middleware must be used for this to work.
  const token = req.cookies.token;

  // 2. Check if the token is missing.
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    // 3. Retrieve the JWT secret from environment variables.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      // It's better to send a generic server error to the client
      return res.status(500).send('Server Error');
    }

    // 4. Verify the token.
    const decoded = jwt.verify(token, jwtSecret);

    // 5. Attach the decoded user payload to the request object.
    //    Using our custom IAuthRequest interface makes this type-safe.
    req.user = (decoded as any).user;

    // 6. Pass control to the next middleware or controller.
    next();
  } catch (error) {
    // 7. If verification fails, the token is invalid.
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Not authorized, token is invalid.' });
  }
};

export default authMiddleware;