import Topic from '../models/topicModel.js';
import quizService from './learnQuizService.js';

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
      if (mongoose.Types.ObjectId.isValid(topicId)) {
        topic = await Topic.findById(topicId);
      }
      
      // If not found by ID, try by name
      if (!topic) {
        topic = await Topic.findOne({ name: new RegExp(`^${topicId}$`, 'i') });
      }
      
      if (!topic) {
        throw new Error('Topic not found');
      }
      
      // Generate explanation content using AI
      const topicContent = await quizService.generateTopicExplanation(
        topic.name,
        topic.difficulty
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
