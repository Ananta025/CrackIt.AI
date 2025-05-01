import ResumeTemplate from '../models/resumeTemplateModel.js';
import mongoose from 'mongoose';
import { responseFormatter } from '../utils/responseFormatter.js';

/**
 * Get all templates
 */
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ResumeTemplate.find({ isActive: true });
    
    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No templates found. Please run the template seeding process.'
      });
    }
    
    return res.status(200).json(responseFormatter.formatResumeTemplatesResponse(templates));
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
};

/**
 * Get template by ID
 */
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }
    
    const template = await ResumeTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error.message
    });
  }
};

/**
 * Create a new template (admin only)
 */
export const createTemplate = async (req, res) => {
  try {
    const { name, category, description, htmlTemplate, css, isActive } = req.body;
    
    if (!name || !category || !description || !htmlTemplate || !css) {
      return res.status(400).json({
        success: false,
        message: 'Missing required template fields'
      });
    }
    
    // Check if template with same name exists
    const existingTemplate = await ResumeTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: 'A template with this name already exists'
      });
    }
    
    const newTemplate = new ResumeTemplate({
      name,
      category,
      description,
      htmlTemplate,
      css,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await newTemplate.save();
    
    return res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: {
        _id: newTemplate._id,
        name: newTemplate.name
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
};
