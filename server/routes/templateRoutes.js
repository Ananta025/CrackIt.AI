import { Router } from 'express';
import { 
  getAllTemplates, 
  getTemplateById, 
  createTemplate 
} from '../controllers/templateController.js';
import authMiddleware from '../middlewares/authMiddlwware.js';

const router = Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);

// Admin routes (requires auth)
router.use(authMiddleware.authenticateUser);
router.post('/', createTemplate);

export default router;
