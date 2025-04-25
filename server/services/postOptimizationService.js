import { aiService } from './aiService'; // Import the AI service for generating responses

/**
 * Optimize LinkedIn post content using AI
 * 
 * @param {string} postContent - Original post content
 * @param {string} targetAudience - Target audience for the post
 * @param {string} purpose - Purpose of the post
 * @returns {Promise<Object>} - Optimization suggestions
 */
async function optimizePost(postContent, targetAudience, purpose) {
  // Create the system prompt for the AI
  const systemPrompt = "You are a LinkedIn content optimization expert. Provide detailed, specific recommendations to improve LinkedIn posts for maximum engagement, visibility, and effectiveness.";
  
  // Create the user prompt with the post data
  const userPrompt = `
  I need to optimize a LinkedIn post. Here's the information:
  
  Original post content: ${postContent}
  Target audience: ${targetAudience || 'General LinkedIn users'}
  Purpose of the post: ${purpose || 'Engagement and visibility'}
  
  Please optimize this LinkedIn post to increase engagement and effectiveness. Provide the response in a structured JSON format with the following structure:
  {
    "optimizedPost": "The complete optimized post content",
    "hashtags": ["Suggested hashtag 1", "Suggested hashtag 2", "Suggested hashtag 3"],
    "improvements": {
      "content": ["Content improvement 1", "Content improvement 2"],
      "structure": ["Structure improvement 1", "Structure improvement 2"],
      "engagement": ["Engagement tip 1", "Engagement tip 2"]
    },
    "analysis": {
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"]
    },
    "bestPractices": ["Best practice 1", "Best practice 2"]
  }
  `;
  
  // Generate the AI response
  const aiResponse = await aiService.generateAIResponse(systemPrompt, userPrompt);
  
  // Parse the AI response into a JSON object
  return aiService.parseAIResponse(aiResponse);
}

export default {
  optimizePost,
};