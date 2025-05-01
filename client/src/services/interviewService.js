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
  // Start a new interview session
  startInterview: async (type, settings) => {
    try {
      console.log(`Starting ${type} interview with settings:`, settings);
      const response = await api.post('/start', {
        user: localStorage.getItem('userId'),
        type,
        settings
      });
      console.log('Interview started successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to start interview:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to start interview' };
    }
  },

  // Send a message/answer during an interview
  sendMessage: async (interviewId, message) => {
    try {
      console.log(`Sending message for interview ${interviewId}:`, message.substring(0, 50) + '...');
      const response = await api.post('/message', {
        interviewId,
        message
      });
      console.log('Received raw response:', response.data);
      
      // Better handle the response data
      const processedResponse = { ...response.data };
      
      // Ensure message is a string
      if (processedResponse.message) {
        if (typeof processedResponse.message === 'object') {
          console.log('Converting message object to string:', processedResponse.message);
          
          // If it's an empty object
          if (Object.keys(processedResponse.message).length === 0) {
            processedResponse.message = "No question available";
          }
          // If it has a response property (from backend service)
          else if (processedResponse.message.response) {
            processedResponse.message = processedResponse.message.response;
          }
          // Otherwise try to JSON stringify
          else {
            try {
              processedResponse.message = JSON.stringify(processedResponse.message);
            } catch (e) {
              processedResponse.message = "Error processing question";
            }
          }
        }
      } else {
        // If message property is missing but response exists
        if (processedResponse.response && typeof processedResponse.response === 'string') {
          processedResponse.message = processedResponse.response;
        } else {
          processedResponse.message = "No question available";
        }
      }
      
      console.log('Processed response message:', processedResponse.message);
      return processedResponse;
    } catch (error) {
      console.error('Failed to process response:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to process response' };
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
      const response = await api.get(`/${interviewId}`);
      return response.data.interview || {};
    } catch (error) {
      console.error('Error fetching interview details:', error);
      throw error.response?.data || { 
        message: 'Failed to fetch interview details',
        status: error.response?.status || 500
      };
    }
  }
};

export default interviewService;
