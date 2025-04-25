import { aiService } from './aiService'; // Import the AI service for generating responses

/**
 * Optimize LinkedIn profile using AI
 * 
 * @param {Object} profileData - LinkedIn profile data
 * @returns {Promise<Object>} - Optimization suggestions
 */
async function optimizeProfile(profileData) {
  // Create the system prompt for the AI
  const systemPrompt = "You are a LinkedIn profile optimization expert. Provide detailed, specific recommendations to improve the LinkedIn profile. Focus on proven strategies that increase profile visibility, engagement, and effectiveness for career advancement.";
  
  // Create the user prompt with the profile data
  const userPrompt = `
  I need to optimize a LinkedIn profile. Here's the current profile information:
  
  Name: ${profileData.name || 'Not provided'}
  Headline: ${profileData.headline || 'Not provided'}
  About: ${profileData.about || 'Not provided'}
  Experience: ${Array.isArray(profileData.experience) ? profileData.experience.join('\n') : 'Not provided'}
  Education: ${Array.isArray(profileData.education) ? profileData.education.join('\n') : 'Not provided'}
  Skills: ${Array.isArray(profileData.skills) ? profileData.skills.join(', ') : 'Not provided'}
  
  Please provide specific recommendations to improve this LinkedIn profile in the following areas:
  1. Profile headline optimization
  2. About section enhancements
  3. Experience description improvements
  4. Skills section recommendations
  5. Overall profile optimization tips
  
  Provide the response in a structured JSON format with the following structure:
  {
    "headline": {
      "analysis": "Analysis of current headline",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
      "examples": ["Example headline 1", "Example headline 2"]
    },
    "about": {
      "analysis": "Analysis of current about section",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
      "examples": "Example about section"
    },
    "experience": {
      "analysis": "Analysis of current experience descriptions",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
      "examples": "Example of improved experience description"
    },
    "skills": {
      "analysis": "Analysis of current skills section",
      "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
      "suggestedSkills": ["Skill 1", "Skill 2"]
    },
    "overall": {
      "analysis": "Overall profile analysis",
      "recommendations": ["Overall improvement 1", "Overall improvement 2"],
      "priorityActions": ["Priority action 1", "Priority action 2"]
    }
  }
  `;
  
  // Generate the AI response
  const aiResponse = await aiService.generateAIResponse(systemPrompt, userPrompt);
  
  // Parse the AI response into a JSON object
  return aiService.parseAIResponse(aiResponse);
}

export default {
  optimizeProfile
};