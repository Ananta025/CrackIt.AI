import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Create axios instance with default config
const resumeApi = axios.create({
  baseURL: `${API_URL}/api/resume`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests when available
resumeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to safely stringify objects
const ensureString = (value) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Mock generators for fallback when API fails
const mockGenerators = {
  summary: () => "Results-driven professional with proven expertise in problem-solving and delivering impactful solutions. Skilled in combining technical knowledge with strategic thinking to optimize processes and drive business growth. Committed to excellence with a track record of successfully leading projects from conception to completion.",
  
  description: () => "• Led development of key features that increased user engagement by 30%\n• Collaborated with design team to implement responsive UI components\n• Optimized database queries resulting in 40% performance improvement\n• Mentored junior developers and conducted code reviews",
  
  skills: () => ["JavaScript", "React.js", "Node.js", "TypeScript", "HTML/CSS", "REST APIs", "Git", "Agile/Scrum", "Problem Solving", "Communication"]
};

const resumeService = {
  // Analyze resume file
  analyzeResume: async (file) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await resumeApi.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw error.response?.data || { 
        success: false,
        message: 'Error analyzing resume' 
      };
    }
  },
  
  // Generate content for a specific section
  generateSection: async (sectionType, userInput) => {
    try {
      const response = await resumeApi.post('/generate-section', {
        sectionType,
        userInput,
      });
      
      // Ensure proper response format
      if (response.data) {
        // Set a default success response if structure is missing
        if (!response.data.hasOwnProperty('success')) {
          return {
            success: true,
            data: response.data
          };
        }
        return response.data;
      }
      
      return {
        success: false,
        message: 'Invalid response from server'
      };
    } catch (error) {
      console.error('Error generating section:', error);
      
      // Use mock generators for fallback when API fails
      if (mockGenerators[sectionType]) {
        console.log(`Using fallback generator for ${sectionType}`);
        return {
          success: true,
          data: mockGenerators[sectionType](),
          fromFallback: true
        };
      }
      
      throw error.response?.data || {
        success: false, 
        message: `Error generating content: ${error.message}`
      };
    }
  },
  
  // Get resume templates
  getTemplates: async () => {
    try {
      const response = await resumeApi.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error.response?.data || {
        success: false, 
        message: 'Error fetching templates'
      };
    }
  },
  
  // Save resume
  saveResume: async (resumeData) => {
    try {
      // Ensure content.summary is a string
      const processedResumeData = {
        ...resumeData,
        content: {
          ...resumeData.content,
          summary: ensureString(resumeData.content?.summary)
        }
      };
      
      const response = await resumeApi.post('/save', processedResumeData);
      return response.data;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error saving resume' 
      };
    }
  },
  
  // Get user resumes
  getUserResumes: async () => {
    try {
      const response = await resumeApi.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error fetching user resumes'
      };
    }
  },
  
  // Download resume as PDF
  downloadResume: async (resumeId) => {
    try {
      const response = await resumeApi.get(`/download/${resumeId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error.response?.data || {
        success: false,
        message: 'Error downloading resume'
      };
    }
  },
};

export default resumeService;
