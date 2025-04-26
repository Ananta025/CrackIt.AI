import mongoose from 'mongoose';

const userResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeTemplate'
    },
    content: {
      header: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        portfolio: String
      },
      summary: String,
      education: [{
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        description: String
      }],
      experience: [{
        company: String,
        title: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: [String]
      }],
      skills: [String],
      projects: [{
        name: String,
        description: String,
        technologies: [String],
        link: String
      }],
      certifications: [{
        name: String,
        issuer: String,
        date: Date,
        description: String
      }]
    },
    pdfUrl: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

const UserResume = mongoose.model('UserResume', userResumeSchema);

export default UserResume;
