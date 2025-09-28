import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes by verifying a JSON Web Token (JWT).
 *
 * This function checks for a token in the 'Authorization' header.
 * If the token exists and is valid, it decodes the payload, attaches
 * it to the request object, and passes control to the next middleware.
 * If the token is missing or invalid, it sends a 401 Unauthorized response.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get the token from the 'Authorization' header.
  //    The header format is typically "Bearer <token>".
  const authHeader = req.header('Authorization');

  // 2. Check if the header or token is missing.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    // 3. Extract the token from the header ("Bearer ".length is 7).
    const token = authHeader.substring(7);

    // 4. Retrieve the JWT secret from environment variables.
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      return res.status(500).send('Server Error: JWT secret is missing.');
    }

    // 5. Verify the token using the secret key.
    //    If verification is successful, `decoded` will contain our payload (e.g., { user: { id: '...' } }).
    const decoded = jwt.verify(token, jwtSecret);

    // 6. Attach the decoded user payload to the request object.
    //    This makes the user's information available in subsequent controllers.
    //    We need to extend the Express Request type for this to be type-safe.
    (req as any).user = (decoded as any).user;

    // 7. Pass control to the next function in the middleware chain (e.g., the route controller).
    next();
  } catch (error) {
    // 8. If `jwt.verify` fails (e.g., token is expired or malformed), it throws an error.
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Not authorized, token is invalid.' });
  }
};

export default authMiddleware;