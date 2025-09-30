import express from 'express';
import {
  loginUser,
  addUser,
  getUsers,
  deleteUser,
  updateUserProfile,
} from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';

// Create a new router instance from Express
const router = express.Router();
 
 
router.post('/login', loginUser);

 
router.post('/add', authMiddleware, addUser);

// @route   GET /api/auth/users
// @desc    Get a list of all users.
// @access  Private
router.get('/users', authMiddleware, getUsers);
router.patch('/profile', authMiddleware, updateUserProfile);
// @route   DELETE /api/auth/:id
// @desc    Delete a user by their ID.
// @access  Private
router.delete('/:id', authMiddleware, deleteUser);

// Export the router to be used in the main server file
export default router;