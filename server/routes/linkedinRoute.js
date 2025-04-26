import express from 'express';
import linkedinController from '../controllers/linkedinController.js';
import { 
  validateProfileUrl, 
  validateProfileData, 
  validatePostData,
  validateSectionRegeneration,
  validateOptimizationAccess
} from '../middlewares/validator.js';
import authMiddleware from '../middlewares/authMiddlwware.js';

const router = express.Router();

// Fix: Use the middleware function correctly
// Add authentication to routes that need it
router.use(authMiddleware.authenticateUser);

// Profile routes
router.post('/profile/optimize-by-url', validateProfileUrl, linkedinController.optimizeProfileByUrl);
router.post('/profile/optimize-manual', validateProfileData, linkedinController.optimizeManualProfile);
router.post('/profile/regenerate-section', validateSectionRegeneration, linkedinController.regenerateProfileSection);
router.post('/profile/save-optimization', validateProfileData, linkedinController.saveProfileOptimization);
router.get('/profile/optimizations/:userId', validateOptimizationAccess, linkedinController.getUserOptimizations);

// Post routes
router.post('/post/optimize', validatePostData, linkedinController.optimizePostContent);

export default router;
