import mongoose from 'mongoose';

const resumeTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['Modern', 'Simple', 'Professional', 'Creative'],
      default: 'Simple'
    },
    description: {
      type: String,
      required: true
    },
    htmlTemplate: {
      type: String,
      required: true
    },
    css: {
      type: String,
      required: true
    },
    previewImage: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);

export default ResumeTemplate;
