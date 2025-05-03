import express from 'express';
import { 
  startInterview,
  sendMessage,
  getInterviewHistory,
  getInterviewById
} from '../controllers/interviewController.js';
import authMiddleware from '../middlewares/authMiddlwware.js';

const router = express.Router();

// Fix: Correctly reference the authenticateUser function from the middleware object
router.use(authMiddleware.authenticateUser);

// Route handlers
router.post('/start', startInterview);
router.post('/message', sendMessage);
router.get('/history', getInterviewHistory);
router.get('/detail/:id', getInterviewById);

export default router;