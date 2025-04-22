import { processResumeFile } from '../services/resumeService.js';

/**
 * Controller to handle resume analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const analyzeResume = async (req, res) => {
  try {
    // Ensure file is uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    // Process the resume file
    const analysis = await processResumeFile(req.file.buffer);
    
    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze resume',
      error: error.message
    });
  }
};
