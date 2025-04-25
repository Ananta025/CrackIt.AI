import express from 'express';
import profileController from '../controllers/profileController.js';
import { validateProfileUrl, validateProfileData } from '../middlewares/validator.js';


const router = express.Router();

// Route to optimize profile using LinkedIn URL
router.post('/optimize-by-url', validateProfileUrl, profileController.optimizeByUrl);

// Route to optimize profile using manually inputted data
router.post('/optimize-manual', validateProfileData, profileController.optimizeManualProfile);

export default router;