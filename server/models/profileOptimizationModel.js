import mongoose from 'mongoose';

const profileOptimizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalProfile: {
    name: String,
    headline: String,
    about: String,
    experience: Array,
    education: Array,
    skills: Array,
    profileUrl: String
  },
  optimizedProfile: {
    headline: String,
    about: String,
    experience: Array,
    education: Array,
    skills: Array,
    overallSuggestions: Array
  },
  comparison: {
    overallImprovement: Number,
    headlineImprovement: Number,
    aboutImprovement: Number,
    experienceImprovement: Number,
    educationImprovement: Number,
    skillsImprovement: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster lookups
profileOptimizationSchema.index({ userId: 1, createdAt: -1 });

const ProfileOptimization = mongoose.model('ProfileOptimization', profileOptimizationSchema);

export default ProfileOptimization;
