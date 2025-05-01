import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  optimizeByUrl: '/api/linkedin/profile/optimize-by-url',
  optimizeManual: '/api/linkedin/profile/optimize-manual',
  regenerateSection: '/api/linkedin/profile/regenerate-section',
  saveOptimization: '/api/linkedin/profile/save-optimization',
  getUserOptimizations: '/api/linkedin/profile/optimizations',
  optimizePost: '/api/linkedin/post/optimize'
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    withCredentials: true
  };
};

const linkedinService = {
  /**
   * Optimize LinkedIn profile by URL
   * @param {string} profileUrl - LinkedIn profile URL
   * @returns {Promise<Object>} - Optimization results
   */
  optimizeProfileByUrl: async (profileUrl) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.optimizeByUrl}`, 
        { profileUrl },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing profile by URL:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized error specifically
        throw { message: 'Please login to access this feature', requiresAuth: true };
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Optimize LinkedIn profile with manual data
   * @param {Object} profileData - Manual profile data
   * @returns {Promise<Object>} - Optimization results
   */
  optimizeManualProfile: async (profileData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.optimizeManual}`, 
        { profileData },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing manual profile:', error);
      if (error.response?.status === 401) {
        throw { message: 'Please login to access this feature', requiresAuth: true };
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Regenerate a specific section of the profile
   * @param {Object} profileData - Complete profile data
   * @param {string} section - Section to regenerate
   * @returns {Promise<Object>} - Regenerated section
   */
  regenerateSection: async (profileData, section) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.regenerateSection}`, 
        { profileData, section },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error regenerating ${section} section:`, error);
      if (error.response?.status === 401) {
        throw { message: 'Please login to access this feature', requiresAuth: true };
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Save profile optimization to user account
   * @param {Object} optimizationData - Data to save
   * @returns {Promise<Object>} - Save confirmation
   */
  saveOptimization: async (originalProfile, optimizedProfile) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.saveOptimization}`, 
        { originalProfile, optimizedProfile },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error saving optimization:', error);
      if (error.response?.status === 401) {
        throw { message: 'Please login to access this feature', requiresAuth: true };
      }
      throw error.response?.data || error;
    }
  },

  /**
   * Optimize LinkedIn post content
   * @param {string} postContent - Original post content
   * @param {string} targetAudience - Target audience
   * @param {string} purpose - Post purpose
   * @returns {Promise<Object>} - Optimized post
   */
  optimizePost: async (postContent, targetAudience, purpose) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.optimizePost}`, 
        { postContent, targetAudience, purpose },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing post:', error);
      if (error.response?.status === 401) {
        throw { message: 'Please login to access this feature', requiresAuth: true };
      }
      throw error.response?.data || error;
    }
  }
};

export default linkedinService;
