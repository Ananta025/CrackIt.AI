const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'hr'],
    required: true
  },
  settings: {
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    duration: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    },
    focus: [String]
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in minutes
  questions: [{
    text: String,
    answer: String,
    feedback: {
      star: {
        situation: String,
        task: String,
        action: String,
        result: String
      },
      strengths: [String],
      improvements: [String],
      rating: Number
    }
  }],
  results: {
    overallScore: Number,
    feedback: String,
    skillScores: {
      communication: Number,
      technical: Number,
      problemSolving: Number,
      behavioral: Number,
      leadership: Number
    },
    strengths: [String],
    weaknesses: [String],
    improvementTips: [String]
  }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;