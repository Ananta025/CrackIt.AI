import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import linkedinService from '../services/linkedinService';

const ProfileOptimizerContext = createContext();

export const useProfileOptimizer = () => useContext(ProfileOptimizerContext);

export const ProfileOptimizerProvider = ({ children }) => {
  const [selectedOption, setSelectedOption] = useState(''); // 'url', 'form', or ''
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [optimizedProfile, setOptimizedProfile] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  /**
   * Reset all state values to default
   */
  const resetState = () => {
    setSelectedOption('');
    setIsLoading(false);
    setError(null);
    setOriginalProfile(null);
    setOptimizedProfile(null);
    setComparison(null);
    setShowResults(false);
  };

  /**
   * Handle auth errors that may occur during API calls
   */
  const handleAuthError = (error) => {
    if (error.requiresAuth) {
      // Redirect to login page
      alert('Please login to access this feature');
      navigate('/signin', { 
        state: { 
          from: '/linkedin', 
          message: 'Please sign in to use the LinkedIn profile optimizer'
        } 
      });
      return true;
    }
    return false;
  };

  /**
   * Optimize profile by URL
   * @param {string} profileUrl - LinkedIn profile URL
   */
  const optimizeByUrl = async (profileUrl) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await linkedinService.optimizeProfileByUrl(profileUrl);
      
      setOriginalProfile(result.originalProfile);
      setOptimizedProfile(result.optimizedProfile);
      setComparison(result.comparison);
      setShowResults(true);
      
      return result;
    } catch (error) {
      // Handle auth errors separately
      if (handleAuthError(error)) {
        resetState();
        return;
      }
      
      setError(error.message || 'Failed to optimize profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Optimize profile with manual data
   * @param {Object} profileData - Manual profile data
   */
  const optimizeManualProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await linkedinService.optimizeManualProfile(profileData);
      
      setOriginalProfile(result.originalProfile);
      setOptimizedProfile(result.optimizedProfile);
      setComparison(result.comparison);
      setShowResults(true);
      
      return result;
    } catch (error) {
      // Handle auth errors separately
      if (handleAuthError(error)) {
        resetState();
        return;
      }
      
      setError(error.message || 'Failed to optimize profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Regenerate a specific section of the profile
   * @param {string} section - Section to regenerate
   */
  const regenerateSection = async (section) => {
    if (!originalProfile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await linkedinService.regenerateSection(originalProfile, section);
      
      // Update only the specific section in the optimized profile
      setOptimizedProfile(prev => ({
        ...prev,
        [section]: result.optimized[section] || prev[section]
      }));
      
      return result;
    } catch (error) {
      // Handle auth errors separately
      if (handleAuthError(error)) {
        return;
      }
      
      setError(`Failed to regenerate ${section}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save profile optimization to user account
   */
  const saveOptimization = async () => {
    if (!originalProfile || !optimizedProfile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await linkedinService.saveOptimization(originalProfile, optimizedProfile);
      return result;
    } catch (error) {
      // Handle auth errors separately
      if (handleAuthError(error)) {
        return;
      }
      
      setError('Failed to save optimization');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    selectedOption,
    setSelectedOption,
    isLoading,
    error,
    setError,
    originalProfile,
    optimizedProfile,
    comparison,
    showResults,
    optimizeByUrl,
    optimizeManualProfile,
    regenerateSection,
    saveOptimization,
    resetState
  };

  return (
    <ProfileOptimizerContext.Provider value={value}>
      {children}
    </ProfileOptimizerContext.Provider>
  );
};