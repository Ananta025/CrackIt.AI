import { 
  processResumeFile,
  processResumeFileStructured,
  analyzeResumeStructured,
  generateResumeSection
} from '../services/resumeService.js';
import ResumeTemplate from '../models/resumeTemplateModel.js';
import UserResume from '../models/userResumeModel.js';
import { generateResumePDF } from '../utils/pdfGenerator.js';
import config from '../config/config.js';
import mongoose from 'mongoose';
import { responseFormatter } from '../utils/responseFormatter.js';

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
    const analysis = await processResumeFileStructured(req.file.buffer, req.file.mimetype);
    
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

/**
 * Get available resume templates
 */
export const getResumeTemplates = async (req, res) => {
  try {
    const templates = await ResumeTemplate.find({ isActive: true }, 
      'name category description previewImage');
    
    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No templates available. Please create a template first.'
      });
    }
    
    return res.status(200).json(responseFormatter.formatResumeTemplatesResponse(templates));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch resume templates',
      error: error.message
    });
  }
};

/**
 * Generate content for a specific resume section
 */
export const generateSection = async (req, res) => {
  try {
    const { sectionType, userInput } = req.body;
    
    if (!sectionType) {
      return res.status(400).json({
        success: false,
        message: 'Section type is required'
      });
    }
    
    // Generate content with proper error handling
    let generatedContent;
    try {
      generatedContent = await generateResumeSection(sectionType, userInput || {});
    } catch (error) {
      console.error('Error generating content:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to generate ${sectionType} content: ${error.message}`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: generatedContent
    });
  } catch (error) {
    console.error('Section generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate section content',
      error: error.message
    });
  }
};

/**
 * Save a new or updated resume
 */
export const saveResume = async (req, res) => {
  try {
    const { resumeId, name, templateId, content } = req.body;
    
    if (!name || !templateId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Resume name, template and content are required'
      });
    }
    
    // Process content to ensure data types are correct
    const processedContent = {
      ...content,
      summary: typeof content.summary === 'string' ? content.summary : JSON.stringify(content.summary),
    };
    
    // Find template by name or ID
    let template;
    try {
      // First try to find by ID (if it's a valid ObjectId)
      if (mongoose.Types.ObjectId.isValid(templateId)) {
        template = await ResumeTemplate.findById(templateId);
      }
      
      // If not found by ID, try to find by name
      if (!template) {
        template = await ResumeTemplate.findOne({ name: { $regex: new RegExp(`^${templateId}$`, 'i') } });
      }
      
      // If still not found, use default template
      if (!template) {
        template = await ResumeTemplate.findOne({ name: 'Modern' });
        if (!template) {
          // Get the first available template as a fallback
          template = await ResumeTemplate.findOne();
        }
      }
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'No templates available. Please create a template first.'
        });
      }
    } catch (error) {
      console.error('Template lookup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error finding template',
        error: error.message
      });
    }
    
    let resume;
    let isNewResume = !resumeId;
    
    if (resumeId) {
      // Update existing resume
      resume = await UserResume.findOneAndUpdate(
        { _id: resumeId, user: req.user._id },
        { 
          name, 
          template: template._id,
          content: processedContent
        },
        { new: true }
      );
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found or not owned by user'
        });
      }
    } else {
      // Create new resume
      resume = new UserResume({
        user: req.user._id,
        name,
        template: template._id,
        content: processedContent
      });
      
      await resume.save();
    }
    
    return res.status(200).json(
      responseFormatter.formatResumeSaveResponse(resume._id, isNewResume)
    );
  } catch (error) {
    console.error('Resume save error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save resume',
      error: error.message
    });
  }
};

/**
 * Generate and download resume as PDF
 */
export const generatePDF = async (req, res) => {
  try {
    const { resumeId } = req.params;
    
    // Find the resume and verify ownership
    const resume = await UserResume.findOne({ 
      _id: resumeId,
      user: req.user._id
    });
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or not owned by user'
      });
    }
    
    // Get the template
    const template = await ResumeTemplate.findById(resume.template);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Resume template not found'
      });
    }
    
    console.log(`Generating PDF for resume: ${resumeId}, template: ${template.name}`);
    
    // Generate PDF with improved error handling
    let pdfBuffer;
    try {
      pdfBuffer = await generateResumePDF(template, resume.content);
    } catch (error) {
      console.error('PDF generation failed:', error);
      return res.status(500).json({
        success: false,
        message: `PDF generation failed: ${error.message}`
      });
    }
    
    // Basic validation on the buffer
    if (!pdfBuffer || pdfBuffer.length < 1000) { // Minimum size check
      console.error('Generated PDF buffer is invalid or too small');
      return res.status(500).json({
        success: false,
        message: 'Failed to generate PDF: Invalid document size'
      });
    }
    
    console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    
    try {
      // Set proper headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', 
        `attachment; filename="${encodeURIComponent(resume.name.replace(/\s+/g, '_'))}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send PDF data directly
      return res.end(pdfBuffer);
    } catch (error) {
      console.error('Error sending PDF response:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending PDF response',
        error: error.message
      });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};

/**
 * List all resumes for the current user
 */
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await UserResume.find({ user: req.user._id })
      .select('name template atsScore createdAt updatedAt')
      .populate('template', 'name category');
    
    return res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message
    });
  }
};
