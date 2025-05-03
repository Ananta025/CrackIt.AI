import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Configure axios with credentials
const api = axios.create({
  baseURL: `${API_URL}/api/interview`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('API request error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  console.error('API response error:', error.response?.data || error.message);
  return Promise.reject(error);
});

const interviewService = {
  // Keep track of asked questions to prevent repetition
  askedQuestions: new Set(),
  
  // Reset tracking when starting a new interview
  resetTracking: () => {
    interviewService.askedQuestions.clear();
  },

  // Start a new interview session
  startInterview: async (type, settings) => {
    try {
      // Reset question tracking for new interview
      interviewService.resetTracking();
      
      // Get user information for personalization
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName') || 'Candidate';
      
      console.log(`Starting ${type} interview for ${userName} with settings:`, settings);
      
      const response = await api.post('/start', {
        user: userId,
        type,
        settings,
        userName, // Pass user name for personalization
      });
      
      console.log('Interview started successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to start interview:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to start interview' };
    }
  },

  // Send a message/answer during an interview
  sendMessage: async (interviewId, message, options = {}) => {
    try {
      console.log(`Sending message for interview ${interviewId}:`, message.substring(0, 50) + '...');
      
      // Get interview position (first question, middle, last)
      const isFirstQuestion = interviewService.askedQuestions.size === 0;
      const isLastQuestion = options.isLastQuestion || false;
      
      // Get current asked questions for repetition prevention
      const askedQuestions = [...interviewService.askedQuestions];
      
      const response = await api.post('/message', {
        interviewId,
        message,
        askedQuestions,
        isFirstQuestion,
        isLastQuestion,
        userName: localStorage.getItem('userName') || 'Candidate'
      });
      
      console.log('Received response:', response.data);
      
      // Process the response
      const processedResponse = processInterviewResponse(response.data);
      
      // Track this question to prevent repetition - only if it's not the first question with greeting
      if (processedResponse.message && typeof processedResponse.message === 'string') {
        // Extract actual question part (excluding greeting for first question)
        let questionToTrack = processedResponse.message;
        if (questionToTrack.includes("Hi ") && questionToTrack.includes("I'm Rahul")) {
          // For first question with greeting, extract just the question part
          const parts = questionToTrack.split("CrackIt.AI.");
          if (parts.length > 1) {
            questionToTrack = parts[1].trim();
          }
        }
        
        interviewService.askedQuestions.add(questionToTrack.trim());
      }
      
      return processedResponse;
    } catch (error) {
      console.error('Failed to process message:', error.response?.data || error.message);
      
      // Special handling for completed interviews to guide user to summary
      if (error.response?.data?.message === 'Interview is not in progress') {
        return {
          message: "The interview has been completed. Please view your results.",
          feedback: null,
          interviewEnded: true
        };
      }
      
      throw error.response?.data || { message: 'Failed to process message' };
    }
  },

  // Get interview history
  getInterviewHistory: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch interview history' };
    }
  },

  // Get detailed information about a specific interview
  getInterview: async (interviewId) => {
    try {
      console.log(`Fetching interview details for ID: ${interviewId}`);
      
      // Add a retry mechanism for better reliability
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          const response = await api.get(`/detail/${interviewId}`);
          
          // Check if we have valid data
          if (!response.data || !response.data.interview) {
            console.error('Invalid interview data structure:', response.data);
            throw new Error('Invalid response format from server');
          }
          
          console.log('Interview data fetched successfully:', response.data.interview);
          return response.data.interview;
        } catch (error) {
          lastError = error;
          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            console.log(`Retry attempt ${attempts} for interview data...`);
          }
        }
      }
      
      // If we got here, all attempts failed
      throw lastError || new Error("Failed to fetch interview data after multiple attempts");
    } catch (error) {
      console.error('Error fetching interview details:', error);
      
      // Provide more specific error information
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status || 500;
      
      throw new Error(`Failed to fetch interview details (${statusCode}): ${errorMessage}`);
    }
  }
};

/**
 * Process and normalize interview response from different formats
 */
function processInterviewResponse(responseData) {
  // Create a clean copy of the response
  const processed = { ...responseData };
  
  // Process message field to ensure it's a string
  if (processed.message) {
    if (typeof processed.message === 'object') {
      console.log('Converting message object to string:', processed.message);
      
      // Handle empty object
      if (Object.keys(processed.message).length === 0) {
        processed.message = "No question available";
      }
      // Handle object with response property
      else if (processed.message.response) {
        processed.message = processed.message.response;
      }
      // Handle object with question property (from AI service)
      else if (processed.message.question) {
        processed.message = processed.message.question;
      }
      // Otherwise stringify
      else {
        try {
          processed.message = JSON.stringify(processed.message);
        } catch (e) {
          processed.message = "Error processing question";
        }
      }
    }
    
    // Don't add any additional final question text - it should come from the server
    // Pass through the server's response as is
  } else {
    // If message is missing but response exists
    if (processed.response && typeof processed.response === 'string') {
      processed.message = processed.response;
    } else {
      processed.message = "No question available";
    }
  }
  
  // Return the processed response
  return processed;
}

export default interviewService;
