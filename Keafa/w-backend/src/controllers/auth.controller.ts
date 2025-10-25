import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model'; // Import the User model

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
// export const loginUser = async (req: Request, res: Response) => {
//   const { username, password } = req.body;

//   // Basic validation
//   if (!username || !password) {
//     return res.status(400).json({ message: 'Please provide a username and password.' });
//   }

//   try {
//     // Check if user exists
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     // Check if password matches the hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password!);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials.' });
//     }

//     // User is authenticated, create JWT
//     const payload = {
//       user: {
//         id: user.id, // In mongoose, .id is a virtual getter for ._id.toString()
//         username: user.username,
//       },
//     };

//     const jwtSecret = process.env.JWT_SECRET;
//     if (!jwtSecret) {
//       console.error("FATAL ERROR: JWT_SECRET is not defined.");
//       return res.status(500).send('Server Error');
//     }

//     jwt.sign(
//       payload,
//       jwtSecret,
//       { expiresIn: '1d' }, // Token expires in 1 day
//       (err, token) => {
//         if (err) throw err;
//         // Respond with user data (without password) and the token
//         res.json({
//           token,
//           _id: user.id,
//           username: user.username,
//         });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server Error');
//   }
// };
interface IAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}




export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password.' });
  }

  try {
    // Log an incoming login attempt (do NOT log passwords)
    try {
      const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
      const ua = req.headers['user-agent'] || 'unknown';
      console.info(`Login attempt for username='${username}' from=${ip} ua='${String(ua)}'`);
    } catch (e) {
      // swallow any logging errors
    }
    // Check if user exists (case-insensitive lookup to tolerate capitalization differences from clients)
    // Escape the username for use in a RegExp to avoid accidental regex injection
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const usernameRegex = new RegExp(`^${escapeRegExp(username)}$`, 'i');
    const user = await User.findOne({ username: usernameRegex });
    // Helpful debug log for deployed environments — avoid logging passwords.
    if (!user) {
      console.warn(`Login attempt failed: user not found for username='${username}'`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      // Incorrect password
      try {
        const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
        console.warn(`Login failed: invalid password for username='${username}' from=${ip}`);
      } catch (e) {}
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // User is authenticated, create JWT
    const payload = {
      user: {
        id: user.id, // In mongoose, .id is a virtual getter for ._id.toString()
        username: user.username,
      },
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      return res.status(500).send('Server Error');
    }
    const isProduction = process.env.NODE_ENV === 'production';

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    // At this point authentication succeeded. Log success (no sensitive data).
    try {
      const ip = (req.ip || (req.headers['x-forwarded-for'] as string) || req.connection?.remoteAddress || 'unknown');
      console.info(`Login succeeded for username='${username}' id='${user.id}' from=${ip}`);
    } catch (e) {}

    // Use explicit cookie options so clearing the cookie later matches exactly.
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    // --- Set JWT in an httpOnly cookie ---
    res.cookie('token', token, cookieOptions);
    try {
      console.debug(`Set auth cookie for username='${username}' id='${user.id}'`);
    } catch (e) {}

    // Respond with user data (without password)
    res.json({
      _id: user.id,
      username: user.username,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Logout user and clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };

  // Clear the cookie by name using the same options used to set it.
  res.clearCookie('token', cookieOptions);
  if (!isProduction) {
    console.log('Logout: cleared cookie with options', cookieOptions);
  }
  res.status(200).json({ message: 'Logged out successfully' });
};
interface IAuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}



/**
 * @desc    Add a new user
 * @route   POST /api/auth/add
 * @access  Private (Admin only)
 */
export const addUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Create a new user instance
    user = new User({
      username,
      password,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Return the new user's data (without the password)
    res.status(201).json({
      _id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/auth/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Find all users but exclude the password field for security
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete a user by ID
 * @route   DELETE /api/auth/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Security check: Prevent the master 'admin' account from being deleted
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
  // Now, TypeScript knows that req.user is valid, and the error is gone.
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

    // --- Update Username ---
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });

      if (existingUser && (existingUser as any)._id.toString() !== userId) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      user.username = username;
    }

    // --- Update Password ---
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
    // Stateless profile: return the decoded JWT claims attached by auth middleware.
    // This avoids a DB lookup on every profile call and keeps requests fast.
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Ensure we return the same shape the frontend expects
    return res.json({
      _id: req.user.id,
      username: req.user.username,
    });
  } catch (error) {
    console.error('Failed to return profile:', error);
    res.status(500).send('Server Error');
  }
};