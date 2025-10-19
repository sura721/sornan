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
 const router = express.Router();


router.get('/individuals', authMiddleware, getIndividuals);
import { /*...,*/ updateFamilyAndMembers, /*...*/ } from '../controllers/orders.controller';
 
// router.post('/individuals', authMiddleware, upload.single('tilefImage'), createIndividual);
router.post('/individuals',authMiddleware, upload.array('tilefImages', 4), createIndividual);

  
router.get('/individuals/:id', authMiddleware, getIndividualById);

 
router.put('/individuals/:id', authMiddleware, upload.single('tilefImage'), updateIndividual);

 
router.delete('/individuals/:id', authMiddleware, deleteIndividual);

 
router.get('/families', authMiddleware, getFamilies);
 
router.post('/families', authMiddleware, upload.single('tilefImage'), createFamily);
 
router.get('/families/:id', authMiddleware, getFamilyById);

 
router.put('/families/update/:id', authMiddleware, upload.single('tilefImage'), updateFamilyAndMembers);
router.get('/search', authMiddleware, searchOrders);
router.delete('/families/:id', authMiddleware, deleteFamily);

 export default router;