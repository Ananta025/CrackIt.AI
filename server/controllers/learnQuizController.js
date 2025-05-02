import Topic from '../models/topicModel.js';
import QuizResult from '../models/quizResultModel.js';
import quizService from '../services/learnQuizService.js';
import learningService from '../services/learningService.js';
import mongoose from 'mongoose';

/**
 * Get all topic categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await learningService.getTopicCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

/**
 * Get topics by category
 */
export const getTopics = async (req, res) => {
  try {
    const { category = 'all' } = req.params;
    const topics = await learningService.getTopicsByCategory(category);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

/**
 * Search topics
 */
export const searchTopics = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({ error: 'Search keyword must be at least 2 characters' });
    }
    
    const results = await learningService.searchTopics(keyword);
    res.json(results);
  } catch (error) {
    console.error('Error searching topics:', error);
    res.status(500).json({ error: 'Failed to search topics' });
  }
};

/**
 * Get topic learning content
 */
export const getTopicContent = async (req, res) => {
  try {
    const { topicId } = req.params;
    const content = await learningService.getTopicContent(topicId);
    res.json(content);
  } catch (error) {
    console.error('Error fetching topic content:', error);
    if (error.message === 'Topic not found') {
      res.status(404).json({ error: 'Topic not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch topic content' });
    }
  }
};

/**
 * Generate quiz for a topic
 */
export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate', questionCount = 5, isContentRequest = false } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    // Special case: if this is a content request (fallback from client), generate topic explanation
    if (isContentRequest) {
      const content = await quizService.generateTopicExplanation(topic, difficulty);
      return res.json(content);
    }
    
    if (questionCount < 3 || questionCount > 10) {
      return res.status(400).json({ error: 'Question count must be between 3 and 10' });
    }
    
    const quizData = await quizService.generateQuiz(topic, difficulty, questionCount);
    
    // Store quiz in session to verify answers later
    // Add check for session existence
    if (req.session) {
      req.session.currentQuiz = quizData;
    } else {
      console.warn('Session not available, quiz validation may be compromised');
      // Create a simple in-memory store as fallback (not ideal for production)
      if (!req.app.locals.quizStore) {
        req.app.locals.quizStore = {};
      }
      const quizId = Date.now().toString();
      req.app.locals.quizStore[quizId] = quizData;
      res.cookie('quizId', quizId, { httpOnly: true, maxAge: 3600000 }); // 1 hour
    }
    
    // Remove correct answers from response to client
    const clientQuiz = {
      topic: quizData.topic,
      difficulty: quizData.difficulty,
      questions: quizData.questions.map(q => ({
        question: q.question,
        answers: q.answers
      }))
    };
    
    res.json(clientQuiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

/**
 * Submit quiz answers and get results
 */
export const submitQuiz = async (req, res) => {
  try {
    const { answers, topic, topicId } = req.body;
    const userId = req.user._id;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be provided as an array' });
    }
    
    // Get the quiz from the stored quiz or generate a verification quiz
    let quizData = req.session?.currentQuiz;
    
    // Check fallback quiz store if session not available
    if (!quizData && req.cookies.quizId && req.app.locals.quizStore) {
      const quizId = req.cookies.quizId;
      quizData = req.app.locals.quizStore[quizId];
      // Clean up after use
      delete req.app.locals.quizStore[quizId];
      res.clearCookie('quizId');
    }
    
    // If quiz not in session, regenerate for validation (less secure but functional)
    if (!quizData) {
      if (!topic) {
        return res.status(400).json({ error: 'Original topic is required' });
      }
      quizData = await quizService.generateQuiz(topic);
    }
    
    // Grade the quiz
    const quizResults = quizService.gradeQuiz(answers, quizData);
    
    // Save results to database
    const savedResult = await QuizResult.create({
      userId,
      topic: quizData.topic,
      topicId: topicId || null,
      score: quizResults.score,
      totalQuestions: quizResults.totalQuestions,
      correctAnswers: quizResults.correctAnswers,
      answers: quizResults.answers,
      completedAt: new Date()
    });
    
    // Add explanations to the results
    const resultsWithExplanations = {
      ...quizResults,
      questions: quizData.questions.map((q, i) => ({
        question: q.question,
        correctAnswer: q.correctAnswerIndex,
        explanation: q.explanation,
        userAnswer: answers[i],
        isCorrect: answers[i] === q.correctAnswerIndex
      })),
      resultId: savedResult._id
    };
    
    res.json(resultsWithExplanations);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
};

/**
 * Get user's quiz history
 */
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const history = await QuizResult.find({ userId })
      .sort({ completedAt: -1 })
      .select('topic score totalQuestions correctAnswers completedAt');
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
};

/**
 * Add a new topic
 */
export const addTopic = async (req, res) => {
  try {
    const { name, category, description, difficulty, keywords } = req.body;
    
    // Check if topic already exists
    const existingTopic = await Topic.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingTopic) {
      return res.status(409).json({ error: 'Topic with this name already exists' });
    }
    
    const newTopic = await Topic.create({
      name,
      category,
      description,
      difficulty: difficulty || 'intermediate',
      keywords: keywords || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};
