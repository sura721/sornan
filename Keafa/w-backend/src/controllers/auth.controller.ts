import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model'; // Import the User model

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide a username and password.' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
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

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1d' }, // Token expires in 1 day
      (err, token) => {
        if (err) throw err;
        // Respond with user data (without password) and the token
        res.json({
          token,
          _id: user.id,
          username: user.username,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

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