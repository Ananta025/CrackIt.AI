import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const LEARN_API = `${API_URL}/api/learn`;

// Create separate axios instances for public and authenticated routes
const authApi = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const publicApi = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
  // No withCredentials for public routes
});

// Error handler
const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    console.log(`Status: ${error.response.status} - ${error.response.statusText}`);
    console.log('Response data:', error.response.data);
    return Promise.reject(error.response.data);
  } else if (error.request) {
    console.log('No response received');
    return Promise.reject({ error: 'No response from server' });
  } else {
    console.log('Error setting up request:', error.message);
    return Promise.reject({ error: error.message });
  }
};

// Authentication helpers
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Learning and quiz service methods
const learnQuizService = {
  // Public endpoints - no authentication needed
  getCategories: async () => {
    try {
      const response = await publicApi.get(`${LEARN_API}/categories`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  getTopicsByCategory: async (category = 'all') => {
    try {
      const response = await publicApi.get(`${LEARN_API}/topics/${category}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  searchTopics: async (keyword) => {
    try {
      const response = await publicApi.get(`${LEARN_API}/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Protected endpoints - require authentication
  getTopicContent: async (topicId) => {
    try {
      const headers = getAuthHeader();
      console.log('Getting topic content for:', topicId);
      console.log('Using auth headers:', headers);
      
      // Use public API if no token available, otherwise use auth API
      const api = Object.keys(headers).length === 0 ? publicApi : authApi;
      const response = await api.get(
        `${LEARN_API}/topic/${encodeURIComponent(topicId)}`, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to get topic content:', error);
      // For 404s, let's try direct topic generation instead
      if (error.response && error.response.status === 404) {
        console.log(`Topic "${topicId}" not found, trying direct generation...`);
        return await learnQuizService.getTopicDirectly(topicId);
      }
      return handleError(error);
    }
  },
  
  // Fallback method for topics not found in database
  getTopicDirectly: async (topicName) => {
    try {
      const headers = getAuthHeader();
      const response = await authApi.post(
        `${LEARN_API}/quiz/generate`,
        { 
          topic: topicName,
          isContentRequest: true 
        },
        { headers }
      );
      
      // Format response to match expected structure
      return {
        name: topicName,
        content: response.data
      };
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Rest of methods remain mostly the same
  generateQuiz: async (topic, difficulty = 'intermediate', questionCount = 5) => {
    try {
      const headers = getAuthHeader();
      const response = await authApi.post(
        `${LEARN_API}/quiz/generate`, 
        { topic, difficulty, questionCount },
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  submitQuiz: async (answers, topic, topicId) => {
    try {
      const headers = getAuthHeader();
      const response = await authApi.post(
        `${LEARN_API}/quiz/submit`, 
        { answers, topic, topicId },
        { headers }
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  getQuizHistory: async () => {
    try {
      const headers = getAuthHeader();
      const response = await authApi.get(`${LEARN_API}/quiz/history`, { headers });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};

export default learnQuizService;
