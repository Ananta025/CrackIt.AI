import { GoogleGenAI } from '@google/genai';
import config from '../config/config.js';

/**
 * Generate AI response for LinkedIn optimization using Google Gemini
 * 
 * @param {string} systemPrompt - System instructions for the AI
 * @param {string} userPrompt - User message to process
 * @returns {Promise<string>} - AI-generated response
 */
const generateLinkedinAIResponse = async (systemPrompt, userPrompt) => {
  try {
    // Use environment variables for API key or from config
    const apiKey = process.env.GEMINI_API_KEY || config.ai.gemini.apiKey;
    
    if (!apiKey) {
      throw new Error('AI API key not configured');
    }
    
    // Initialize the Google Generative AI with the API key
    const ai = new GoogleGenAI({ apiKey });
    
    // Combine system prompt and user prompt for Gemini
    // Since Gemini doesn't have distinct system prompts like OpenAI
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Generate content using Gemini API
    const response = await ai.models.generateContent({
      model: config.ai.gemini.defaultModel,
      contents: combinedPrompt,
    });

    // Extract the text from the response
    return response.text;
  } catch (error) {
    console.error('LinkedIn AI generation error:', error);
    throw new Error('Failed to generate LinkedIn optimization: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Parse AI response into a structured JSON object
 * 
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} - Parsed JSON object
 */
const parseLinkedinAIResponse = (aiResponse) => {
  try {
    // Extract JSON from the response
    // This handles cases where the AI might add explanatory text before/after the JSON
    const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
    const match = aiResponse.match(jsonRegex);
    
    if (match) {
      const jsonString = match[1] || match[2];
      return JSON.parse(jsonString);
    }
    
    // If no JSON formatting found, try parsing the whole response
    return JSON.parse(aiResponse);
  } catch (error) {
    console.error('Failed to parse LinkedIn AI response:', error);
    // Return a basic structure if parsing fails
    return {
      error: 'Failed to parse LinkedIn optimization response',
      rawResponse: aiResponse
    };
  }
};

export default {
  generateLinkedinAIResponse,
  parseLinkedinAIResponse
};
