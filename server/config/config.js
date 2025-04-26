/**
 * Application configuration settings
 */
const config = {
  // LinkedIn related settings
  linkedin: {
    // Cookie for authenticated access (would be populated from env in production)
    cookie: process.env.LINKEDIN_COOKIE || '',
    
    // API access settings if using LinkedIn API
    api: {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || ''
    },
    
    // Scraping settings
    scraping: {
      enabled: true,
      timeout: 15000, // 15 second timeout
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  },
  
  // AI service settings
  ai: {
    // OpenAI settings
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: process.env.OPENAI_MODEL || 'gpt-4',
      temperature: 0.7,
      maxTokens: 2500
    },
    
    // Google Gemini settings
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      defaultModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  
  // Database settings
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/crackitai'
  },
  
  // Resume features settings
  resume: {
    allowedFileTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    pdfGeneration: {
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true
    },
    templates: {
      directory: process.env.RESUME_TEMPLATES_DIR || 'e:/CrackIt.AI/server/templates/resumes'
    }
  },
  
  // Application settings
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-for-dev',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

export default config;
