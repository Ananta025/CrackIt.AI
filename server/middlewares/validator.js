import { body, param, validationResult } from 'express-validator';

/**
 * Validate LinkedIn profile URL
 */
export const validateProfileUrl = [
  body('profileUrl')
    .notEmpty().withMessage('LinkedIn profile URL is required')
    .isURL().withMessage('Must be a valid URL')
    .matches(/linkedin\.com\/in\//).withMessage('Must be a valid LinkedIn profile URL'),
  
  validateResults
];

/**
 * Validate manually entered LinkedIn profile data
 */
export const validateProfileData = [
  body('profileData')
    .notEmpty().withMessage('Profile data is required')
    .isObject().withMessage('Profile data must be an object'),
  
  body('profileData.headline')
    .optional()
    .isString().withMessage('Headline must be a string')
    .isLength({ max: 220 }).withMessage('Headline cannot exceed 220 characters'),
  
  body('profileData.about')
    .optional()
    .isString().withMessage('About section must be a string'),
  
  body('profileData.experience')
    .optional()
    .isArray().withMessage('Experience must be an array'),
  
  body('profileData.education')
    .optional()
    .isArray().withMessage('Education must be an array'),
  
  body('profileData.skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  
  validateResults
];

/**
 * Validate LinkedIn post optimization data
 */
export const validatePostData = [
  body('postContent')
    .notEmpty().withMessage('Post content is required')
    .isString().withMessage('Post content must be a string')
    .isLength({ min: 5, max: 3000 }).withMessage('Post content must be between 5 and 3000 characters'),
  
  body('targetAudience')
    .optional()
    .isString().withMessage('Target audience must be a string'),
  
  body('purpose')
    .optional()
    .isString().withMessage('Purpose must be a string'),
  
  validateResults
];

/**
 * Validate profile section regeneration request
 */
export const validateSectionRegeneration = [
  body('profileData')
    .notEmpty().withMessage('Profile data is required')
    .isObject().withMessage('Profile data must be an object'),
  
  body('section')
    .notEmpty().withMessage('Section name is required')
    .isString().withMessage('Section must be a string')
    .isIn(['headline', 'about', 'experience', 'skills', 'education'])
    .withMessage('Invalid section. Must be headline, about, experience, skills, or education'),
  
  validateResults
];

/**
 * Validate saved optimization access
 */
export const validateOptimizationAccess = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  
  validateResults
];

/**
 * Process validation results and return errors if any
 */
function validateResults(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      })) 
    });
  }
  
  next();
}
