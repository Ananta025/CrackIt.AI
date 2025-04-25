import { body, validationResult } from 'express-validator';

// Helper function to validate request data
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// Validate LinkedIn profile URL
const validateProfileUrl = [
  body('profileUrl')
    .notEmpty().withMessage('LinkedIn profile URL is required')
    .isURL().withMessage('Invalid URL format')
    .matches(/linkedin\.com\/in\//).withMessage('Must be a valid LinkedIn profile URL'),
  validateRequest
];

// Validate manually inputted profile data
const validateProfileData = [
  body('profileData').notEmpty().withMessage('Profile data is required'),
  body('profileData.name').notEmpty().withMessage('Name is required'),
  body('profileData.headline').notEmpty().withMessage('Headline is required'),
  body('profileData.about').notEmpty().withMessage('About section is required'),
  validateRequest
];

// Validate post data
const validatePostData = [
  body('postContent').notEmpty().withMessage('Post content is required'),
  body('targetAudience').optional(),
  body('purpose').optional(),
  validateRequest
];

export default {
  validateProfileUrl,
  validateProfileData,
  validatePostData
};