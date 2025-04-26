import linkedinService from '../services/linkedinService.js';
import ProfileOptimization from '../models/profileOptimizationModel.js';
import { responseFormatter } from '../utils/responseFormatter.js';
import { compareProfiles } from '../utils/profileComparer.js';

/**
 * Controller for optimizing LinkedIn profile using URL
 */
const optimizeProfileByUrl = async (req, res, next) => {
  try {
    const { profileUrl, userId } = req.body;
    
    // Scrape LinkedIn profile data
    let profileData;
    try {
      profileData = await linkedinService.scrapeProfile(profileUrl);
    } catch (error) {
      // If scraping fails, return an error that suggests manual entry
      return res.status(400).json({ 
        error: 'LinkedIn profile could not be automatically scraped.',
        message: 'Please use the manual entry form instead.',
        code: 'SCRAPING_FAILED'
      });
    }
    
    // If scraping returned placeholder data that needs manual completion
    if (profileData && profileData.scraped === false) {
      return res.status(202).json({
        message: 'LinkedIn profile URL accepted, but data could not be fully extracted.',
        partialData: {
          profileUrl,
          username: profileData.username
        },
        requiresManualEntry: true
      });
    }
    
    // Optimize profile using AI
    const optimizationResults = await linkedinService.optimizeProfile(profileData);
    
    // Generate comparison between original and optimized profiles
    const comparison = compareProfiles(profileData, optimizationResults);
    
    // Format and send response
    const response = responseFormatter.formatProfileResponse(
      profileData, 
      optimizationResults,
      comparison
    );
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Profile optimization error:', error);
    return res.status(500).json({ 
      error: error.name === 'ScrapingError' 
        ? error.message 
        : 'Failed to optimize profile',
      suggestManualEntry: true
    });
  }
};

/**
 * Controller for optimizing LinkedIn profile using manually inputted data
 */
const optimizeManualProfile = async (req, res, next) => {
  try {
    const { profileData, userId } = req.body;
    
    // Optimize profile using AI
    const optimizationResults = await linkedinService.optimizeProfile(profileData);
    
    // Generate comparison between original and optimized profiles
    const comparison = compareProfiles(profileData, optimizationResults);
    
    // Format and send response
    const response = responseFormatter.formatProfileResponse(
      profileData, 
      optimizationResults,
      comparison
    );
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Manual profile optimization error:', error);
    return res.status(500).json({ error: 'Failed to optimize profile' });
  }
};

/**
 * Controller for regenerating a specific section of the LinkedIn profile
 */
const regenerateProfileSection = async (req, res, next) => {
  try {
    const { profileData, section, userId } = req.body;
    
    if (!['headline', 'about', 'experience', 'skills', 'education'].includes(section)) {
      return res.status(400).json({ error: 'Invalid section specified' });
    }
    
    // Optimize specific section using AI
    const sectionOptimization = await linkedinService.optimizeProfileSection(
      profileData, 
      section
    );
    
    return res.status(200).json({
      section,
      original: profileData[section],
      optimized: sectionOptimization
    });
  } catch (error) {
    console.error('Section regeneration error:', error);
    return res.status(500).json({ error: 'Failed to regenerate section' });
  }
};

/**
 * Save optimized profile results
 */
const saveProfileOptimization = async (req, res, next) => {
  try {
    const { userId, originalProfile, optimizedProfile } = req.body;
    
    if (!userId || !originalProfile || !optimizedProfile) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    // Create new optimization record
    const savedOptimization = await ProfileOptimization.create({
      userId,
      originalProfile,
      optimizedProfile,
      createdAt: new Date()
    });
    
    return res.status(201).json({
      message: 'Profile optimization saved successfully',
      optimizationId: savedOptimization._id
    });
  } catch (error) {
    console.error('Save optimization error:', error);
    return res.status(500).json({ error: 'Failed to save optimization' });
  }
};

/**
 * Get user's saved optimizations
 */
const getUserOptimizations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get all optimizations for the user
    const optimizations = await ProfileOptimization.find({ userId })
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      optimizations: optimizations.map(opt => ({
        id: opt._id,
        createdAt: opt.createdAt,
        originalProfile: {
          headline: opt.originalProfile.headline,
          aboutPreview: opt.originalProfile.about?.substring(0, 100) + '...'
        },
        optimizedProfile: {
          headline: opt.optimizedProfile.headline,
          aboutPreview: opt.optimizedProfile.about?.substring(0, 100) + '...'
        }
      }))
    });
  } catch (error) {
    console.error('Get optimizations error:', error);
    return res.status(500).json({ error: 'Failed to retrieve optimizations' });
  }
};

/**
 * Controller for optimizing LinkedIn post content
 */
const optimizePostContent = async (req, res, next) => {
  try {
    const { postContent, targetAudience, purpose, userId } = req.body;
    
    // Optimize post using AI
    const optimizationResults = await linkedinService.optimizePost(
      postContent, 
      targetAudience, 
      purpose
    );
    
    // Format and send response
    const response = responseFormatter.formatPostResponse(
      postContent, 
      targetAudience, 
      purpose, 
      optimizationResults
    );
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Post optimization error:', error);
    return res.status(500).json({ error: 'Failed to optimize post' });
  }
};

export default {
  optimizeProfileByUrl,
  optimizeManualProfile,
  regenerateProfileSection,
  saveProfileOptimization,
  getUserOptimizations,
  optimizePostContent
};
