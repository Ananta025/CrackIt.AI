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
});

const interviewService = {
  // Start a new interview session
  startInterview: async (type, settings) => {
    try {
      const response = await api.post('/start', {
        user: localStorage.getItem('userId'),
        type,
        settings
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to start interview' };
    }
  },

  // Send a message/answer during an interview
  sendMessage: async (interviewId, message) => {
    try {
      const response = await api.post('/message', {
        interviewId,
        message
      });
      return response.data;
    } catch (error) {
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
