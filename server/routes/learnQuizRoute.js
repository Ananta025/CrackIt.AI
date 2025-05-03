import express from 'express';
import * as learnQuizController from '../controllers/learnQuizController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes that don't require authentication
router.get('/categories', learnQuizController.getCategories);
router.get('/topics/:category', learnQuizController.getTopics);
router.get('/search', learnQuizController.searchTopics);

// Protected routes that require authentication
router.use(authMiddleware.authenticateUser);

// These routes will require authentication
router.get('/topic/:topicId', learnQuizController.getTopicContent);
// router.post('/topic', learnQuizController.addTopic);
router.post('/quiz/generate', learnQuizController.generateQuiz);
router.post('/quiz/submit', learnQuizController.submitQuiz);
router.get('/quiz/history', learnQuizController.getQuizHistory);

export default router;
