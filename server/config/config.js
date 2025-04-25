import dotenv from "dotenv";

dotenv.config();

export default {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // AI configuration
    ai: {
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-3.5-turbo'
    },
    
    // LinkedIn scraping configuration
    linkedin: {
      cookie: process.env.LINKEDIN_COOKIE
    }
}