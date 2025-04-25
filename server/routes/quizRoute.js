import express from 'express';
import { getExplanation, getQuiz } from '../controllers/quizController';
import authenticateUser from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/explain',authenticateUser, getExplanation);
router.post('/quiz',authenticateUser, getQuiz);

export default router;