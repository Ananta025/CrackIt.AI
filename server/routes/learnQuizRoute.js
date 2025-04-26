import express from 'express';
import * as learnQuizController from '../controllers/learnQuizController.js';
import authMiddleware from '../middlewares/authMiddlwware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateUser);

// Topic and learning routes
router.get('/categories', learnQuizController.getCategories);
router.get('/topics/:category', learnQuizController.getTopics);
router.get('/search', learnQuizController.searchTopics);
router.get('/topic/:topicId', learnQuizController.getTopicContent);
router.post('/topic', learnQuizController.addTopic);

// Quiz routes
router.post('/quiz/generate', learnQuizController.generateQuiz);
router.post('/quiz/submit', learnQuizController.submitQuiz);
router.get('/quiz/history', learnQuizController.getQuizHistory);

export default router;
