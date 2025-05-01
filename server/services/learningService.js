import Topic from '../models/topicModel.js';
import quizService from './learnQuizService.js';
import mongoose from 'mongoose';

class LearningService {
  /**
   * Get all available topic categories
   * @returns {Promise<Array>} - List of categories
   */
  async getTopicCategories() {
    const categories = await Topic.distinct('category');
    
    // Map category IDs to display names
    const categoryMap = {
      'technical': 'Technical Skills',
      'behavioral': 'Behavioral Questions',
      'system-design': 'System Design',
      'other': 'Other Skills'
    };
    
    return categories.map(category => ({
      id: category,
      name: categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
    }));
  }

  /**
   * Get topics by category
   * @param {string} category - Category to filter by
   * @param {number} limit - Number of topics to return
   * @returns {Promise<Array>} - List of topics
   */
  async getTopicsByCategory(category, limit = 20) {
    const query = category === 'all' ? {} : { category };
    return Topic.find(query)
      .select('name description difficulty category')
      .sort('name')
      .limit(limit);
  }

  /**
   * Search topics by keyword
   * @param {string} keyword - Keyword to search for
   * @returns {Promise<Array>} - List of matching topics
   */
  async searchTopics(keyword) {
    const regex = new RegExp(keyword, 'i');
    return Topic.find({
      $or: [
        { name: regex },
        { description: regex },
        { keywords: regex }
      ]
    }).select('name description difficulty category');
  }

  /**
   * Get detailed content for a topic
   * @param {string} topicId - Topic ID or name
   * @returns {Promise<Object>} - Topic content
   */
  async getTopicContent(topicId) {
    // Try to find by ID first
    let topic;
    try {
      // Check if topicId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(topicId)) {
        topic = await Topic.findById(topicId);
      }
      
      // If not found by ID, try by name
      if (!topic) {
        // Create case insensitive regex for exact match
        const nameRegex = new RegExp(`^${topicId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
        topic = await Topic.findOne({ name: nameRegex });
      }
      
      // If still not found, check if it's similar to any existing topic
      if (!topic) {
        // Look for partial matches
        const partialRegex = new RegExp(topicId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
        topic = await Topic.findOne({ 
          $or: [
            { name: partialRegex },
            { keywords: partialRegex }
          ] 
        });
      }
      
      // If no topic found at all, create a temporary topic object
      if (!topic) {
        console.log(`Topic not found in database, generating content for: ${topicId}`);
        // Create a temporary topic object to pass to the AI content generator
        topic = {
          name: topicId,
          description: `Information about ${topicId}`,
          difficulty: 'intermediate',
          toObject: () => ({
            name: topicId,
            description: `Information about ${topicId}`,
            difficulty: 'intermediate',
            _id: null
          })
        };
      }
      
      // Generate explanation content using AI
      const topicContent = await quizService.generateTopicExplanation(
        topic.name,
        topic.difficulty || 'intermediate'
      );
      
      return {
        ...topic.toObject(),
        content: topicContent
      };
    } catch (error) {
      console.error('Error getting topic content:', error);
      throw error;
    }
  }
}

const learningService = new LearningService();
export default learningService;
