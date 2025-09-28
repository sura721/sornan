import express from 'express';
import {
  getIndividuals,
  getIndividualById,
  createIndividual,
  updateIndividual,
  deleteIndividual,
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  searchOrders,
} from '../controllers/orders.controller';
import authMiddleware from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

// Create a new router instance from Express
const router = express.Router();


router.get('/individuals', authMiddleware, getIndividuals);

// @route   POST /api/orders/individuals
// @desc    Create a new individual order with an optional image upload
// @access  Private
// `upload.single('tilefImage')` will process a single file uploaded
// in the form field named 'tilefImage'.
router.post('/individuals', authMiddleware, upload.single('tilefImage'), createIndividual);

// @route   GET /api/orders/individuals/:id
// @desc    Get a single individual order by ID
// @access  Private
router.get('/individuals/:id', authMiddleware, getIndividualById);

// @route   PUT /api/orders/individuals/:id
// @desc    Update an individual order
// @access  Private
// Note: This simple PUT route does not handle file uploads. A more complex setup
// would be needed to update an image, but this handles all text/data updates.
router.put('/individuals/:id', authMiddleware, updateIndividual);

// @route   DELETE /api/orders/individuals/:id
// @desc    Delete an individual order
// @access  Private
router.delete('/individuals/:id', authMiddleware, deleteIndividual);


// --- Family Order Routes ---

// @route   GET /api/orders/families
// @desc    Get all family orders
// @access  Private
router.get('/families', authMiddleware, getFamilies);

// @route   POST /api/orders/families
// @desc    Create a new family order with an optional image upload
// @access  Private
router.post('/families', authMiddleware, upload.single('tilefImage'), createFamily);

// @route   GET /api/orders/families/:id
// @desc    Get a single family order by ID (with member details)
// @access  Private
router.get('/families/:id', authMiddleware, getFamilyById);

// @route   PUT /api/orders/families/:id
// @desc    Update a family order
// @access  Private
router.put('/families/:id', authMiddleware, updateFamily);

router.get('/search', authMiddleware, searchOrders);
router.delete('/families/:id', authMiddleware, deleteFamily);

// Export the router to be used in the main server file
export default router;