import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

interface IAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password.' });
  }

  try {
    try {
      const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
      const ua = req.headers['user-agent'] || 'unknown';
      console.info(`Login attempt for username='${username}' from=${ip} ua='${String(ua)}'`);
    } catch (e) {}

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const usernameRegex = new RegExp(`^${escapeRegExp(username)}$`, 'i');
    const user = await User.findOne({ username: usernameRegex });

    if (!user) {
      console.warn(`Login attempt failed: user not found for username='${username}'`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      try {
        const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
        console.warn(`Login failed: invalid password for username='${username}' from=${ip}`);
      } catch (e) {}
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      return res.status(500).send('Server Error');
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    try {
      const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
      console.info(`Login succeeded for username='${username}' id='${user.id}' from=${ip}`);
    } catch (e) {}

    // --- BEARER TOKEN SOLUTION ---
    // Instead of setting an httpOnly cookie, send the token in the response body.
    // The frontend must now store this token (e.g., in localStorage) and include it
    // in the Authorization: Bearer <token> header for all future requests.
    res.json({
      token: token,
      _id: user.id,
      username: user.username,
    });
    // The previous cookie setting logic is intentionally removed here.

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const logoutUser = (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };

  res.clearCookie('token', cookieOptions);
  if (!isProduction) {
    console.log('Logout: cleared cookie with options', cookieOptions);
  }
  res.status(200).json({ message: 'Logged out successfully' });
};

export const addUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password.' });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    user = new User({
      username,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({
      _id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.username === 'admin') {
        return res.status(403).json({ message: 'Cannot delete the master admin account.' });
    }

    await user.deleteOne();

    res.json({ message: 'User removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const updateUserProfile = async (req: IAuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
  }

  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });

      if (existingUser && (existingUser as any)._id.toString() !== userId) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      user.username = username;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new one.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password!);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser.id,
      username: updatedUser.username,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const getUserProfile = async (req: IAuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    return res.json({
      _id: req.user.id,
      username: req.user.username,
    });
  } catch (error) {
    console.error('Failed to return profile:', error);
    res.status(500).send('Server Error');
  }
};