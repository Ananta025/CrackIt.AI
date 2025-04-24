import express from 'express';
import { startInterview, sendMessage, getInterviewHistory, getInterviewById } from '../controllers/interviewController.js';
import  authenticateUser from '../middlewares/authMiddlwware.js'

const router = express.Router();

router.post('/start', authenticateUser, startInterview); 
router.post('/message', authenticateUser, sendMessage);
router.get('/history', authenticateUser, getInterviewHistory);
router.get('/:id', authenticateUser, getInterviewById);

export default router;