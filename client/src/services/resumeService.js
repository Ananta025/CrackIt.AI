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
      console.log(`Requesting PDF download for resume: ${resumeId}`);
      
      // Use axios directly without the interceptor to get binary data properly
      const response = await axios.get(`${API_URL}/api/resume/download/${resumeId}`, {
        responseType: 'arraybuffer', // Using arraybuffer for binary data
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        },
        // Add timeout to prevent hanging requests
        timeout: 30000
      });
      
      // Check if we received valid data
      if (!response.data || response.data.byteLength === 0) {
        console.error('Empty PDF data received');
        throw new Error('Empty PDF data received from server');
      }
      
      console.log(`Received PDF data: ${response.data.byteLength} bytes, type: ${response.headers['content-type']}`);
      
      // Check content type to make sure we're receiving PDF data
      if (!response.headers['content-type']?.includes('application/pdf')) {
        console.warn(`Warning: Expected PDF but got ${response.headers['content-type']}`);
        // Try to see if there's an error message
        try {
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(response.data);
          if (text.includes('"success":false')) {
            const error = JSON.parse(text);
            throw new Error(error.message || 'Error downloading PDF');
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      }
      
      // Convert arraybuffer to blob with appropriate type
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      
      return blob;
    } catch (error) {
      console.error('Error downloading resume:', error);
      if (error.response?.data) {
        // If server returned an error response in JSON format
        try {
          // Try to parse error as JSON
          const decoder = new TextDecoder('utf-8');
          const errorText = decoder.decode(error.response.data);
          
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'Error downloading resume');
          } catch (e) {
            // If not valid JSON, throw error with the text
            throw new Error(`Error downloading resume: ${errorText.substring(0, 100)}...`);
          }
        } catch (e) {
          // If parsing fails, throw the original error
          throw error;
        }
      }
      throw error;
    }
  },
};

export default resumeService;
