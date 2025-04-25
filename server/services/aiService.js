import OpenAI from 'openai';
import config from '../config/config';

// Create a custom error class for AI service errors
class AIServiceError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'AIServiceError';
        this.details = details;
    }
}

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: config.ai.apiKey,
  });



/**
 * Generate an AI response using the OpenAI API
 * 
 * @param {string} systemPrompt - System prompt to control AI behavior
 * @param {string} userPrompt - User prompt with the main content
 * @returns {Promise<string>} - AI-generated response
 */
 


  async function generateAIResponse(systemPrompt, userPrompt) {
    try {
        const response = await openai.chat.completions.create({
            model: config.ai.model,
            message: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    } catch(error) {
        console.error('AI Service Error:', error);
        // Handle errors from OpenAI API
        throw new AIServiceError('Failed to generate AI response', {
            originalError: error.message,
        });
    }
  }

  /**
 * Parse JSON from AI response with error handling
 * 
 * @param {string} aiResponse - The raw AI response text
 * @returns {Object} - Parsed JSON object
 */

  function parseAIResponse(aiResponse) {
    try {
        return JSON.parse(aiResponse);
    } catch (error) {
        console.error('AI Response Parsing Error:', error);
        // Handle JSON parsing errors
        throw new AIServiceError('Failed to parse AI response', {
            rawResponse: aiResponse,
        });
    }
  }

    export default { generateAIResponse, parseAIResponse, AIServiceError };                 