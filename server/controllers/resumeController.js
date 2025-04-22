import ResumeService from '../services/resumeService.js';
import extractText from '../utils/extractText.js';

// Create an instance of ResumeService with your API key
const resumeService = new ResumeService(process.env.GOOGLE_API_KEY);

/**
 * Controller to handle resume review requests
 */
const reviewResume = async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please upload a resume file' 
            });
        }

        // Extract text from the uploaded file
        const resumeText = await extractText(req.file);
        
        // Get analysis and suggestions from the resume service
        const analysis = await resumeService.analyzeResume(resumeText);
        const suggestions = await resumeService.getSuggestions(resumeText);
        
        // Return the feedback
        return res.status(200).json({
            success: true,
            analysis,
            suggestions,
            charCount: resumeText.length
        });
    } catch (error) {
        console.error('Resume review error:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Error processing resume'
        });
    }
};

export { reviewResume };
