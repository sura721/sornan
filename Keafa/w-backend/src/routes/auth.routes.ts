import express from 'express';
import {
  loginUser,
  addUser,
  getUsers,
  deleteUser,
} from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

// Create a new router instance from Express
const router = express.Router();

/**
 * ====================================================================
 * Authentication & User Management Routes
 * ====================================================================
 * Base Path: /api/auth
 */

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token.
// @access  Public
// This route is public because anyone needs to be able to attempt a login.
router.post('/login', loginUser);

// @route   POST /api/auth/add
// @desc    Add a new user.
// @access  Private (Requires a valid token from a logged-in user)
// `authMiddleware` is placed before the controller function. It will run first,
// protecting the route. If the user is not authenticated, the request
// will be rejected before it ever reaches the `addUser` controller.
router.post('/add', authMiddleware, addUser);

// @route   GET /api/auth/users
// @desc    Get a list of all users.
// @access  Private
router.get('/users', authMiddleware, getUsers);

// @route   DELETE /api/auth/:id
// @desc    Delete a user by their ID.
// @access  Private
router.delete('/:id', authMiddleware, deleteUser);

// Export the router to be used in the main server file
export default router;