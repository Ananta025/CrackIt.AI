import { scrapeProfile, ScrapingError } from '../services/profileService.js';
import {optimizeProfile} from '../services/profileOptimizationService.js';
import { responseFormatter } from '../utils/responseFormatter.js';

/**
 * Controller for optimizing LinkedIn profile using URL
 */
const optimizeByUrl = async (req, res, next) => {
    try {
      const { profileUrl } = req.body;
      
      // Scrape LinkedIn profile data
      const profileData = await linkedinScraperService.scrapeProfile(profileUrl);
      
      // Optimize profile using AI
      const optimizationResults = await profileOptimizationService.optimizeProfile(profileData);
      
      // Format and send response
      const response = responseFormatter.formatProfileResponse(profileData, optimizationResults);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Controller for optimizing LinkedIn profile using manually inputted data
   */
 const optimizeManualProfile = async (req, res, next) => {
    try {
      const { profileData } = req.body;
      
      // Optimize profile using AI
      const optimizationResults = await profileOptimizationService.optimizeProfile(profileData);
      
      // Format and send response
      const response = responseFormatter.formatProfileResponse(profileData, optimizationResults);
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  export default {
    optimizeByUrl,
    optimizeManualProfile,
  };