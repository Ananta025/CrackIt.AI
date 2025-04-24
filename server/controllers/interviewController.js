import Interview from "../models/interviewModel";

const startInterview = async (req, res) => {
  const { user, type, settings } = req.body;

  if (!user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!type) {
    return res.status(400).json({ message: "Interview type is required" });
  }

  if (!settings) {
    return res.status(400).json({ message: "Interview settings are required" });
  }

  // Start a new interview
  // Check if the user is valid

  try {
    const interview = await Interview.create({
      user,
      type,
      settings,
      status: "in-progress",
    });

    return res.status(201).json({
      message: "Interview started successfully",
      interview,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error starting the interview", error: error.message });
  }
};

// Send message in interview and get AI response

const sendMessage = async (req, res) => {
  try {
    const { message, interviewId, type } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    if (interview.status !== "in-progress") {
      return res.status(400).json({ message: "Interview is not in progress" });
    }

    const aiResponse = await aiService.processUserResponse(
      message,
      interview,
      type
    );

    if (!aiResponse) {
      return res.status(500).json({ message: "Error processing AI response" });
    }

    // Update interview in database with the new question and answer
    interview.questions.push({
      text:
        interview.questions.length === 0
          ? aiResponse.lastQuestion
          : interview.questions[interview.questions.length - 1].text,
      answer: message,
      feedback: aiResponse.feedback,
    });

    // Check if interview should end
    const shouldInterviewEnd =
      interview.questions.length >=
      getMaxQuestions(interview.settings.duration);
    if (shouldInterviewEnd) {
      interview.status = "completed";
      interview.endTime = new Date();
      interview.duration = Math.round(
        (interview.endTime - interview.startTime) / (1000 * 60)
      );

      interview.results = await aiService.generateInterviewResults(interview);
    }

    await interview.save();

    res.json({
      message: aiResponse.response,
      feedback: aiResponse.feedback,
      interviewEnded: shouldInterviewEnd,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interview history for a user
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Transform interviews for frontend
    const transformedInterviews = interviews.map((interview) => ({
      id: interview._id,
      title: getInterviewTitle(interview),
      type: interview.type,
      date: interview.startTime,
      duration: interview.duration || calculateDuration(interview),
      score: interview.results?.overallScore || 0,
      summary: interview.results?.feedback || "Interview not completed",
      tags: getInterviewTags(interview),
    }));

    // Calculate user stats

    const stats = calculateUserStats(interviews);
    res.json({
      interviews: transformedInterviews,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interview details by ID

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    response.json({ interview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper Functions

const getMaxQuestions = (duration) => {
  switch (duration) {
    case "short":
      return 5;
    case "medium":
      return 10;
    case "long":
      return 15;
    default:
      return 10;
  }
};

const getInterviewTitle = (interview) => {
  const typeMap = {
    technical: "Technical Interview",
    behavioral: "Behavioral Interview",
    hr: "HR Interview",
  };

  return typeMap[interview.type] || "Mock Interview";
};

const getInterviewTags = (interview) => {
  const tags = [];
  if (interview.settings.diffiulty) {
    tags.push(
      interview.settings.difficulty.charAt(0).toUpperCase() +
        interview.settings.difficulty.slice(1)
    );
  }

  if (interview.settings.focus && interview.settings.focus.length > 0) {
    interview.settings.focus.forEach((focus) => {
      tags.push(focus);
    });
  }

  tags.push(interview.status === "completed" ? "Completed" : "In Progress");
  return tags;
};

const calculateUserStats = (interview) => {
  // Initialize stats object
  const stats = {
    totalInterviews: interview.length,
    completedInterviews: 0,
    averageScore: 0,
    scores: {
      communication: 0,
      technical: 0,
      problemSolving: 0,
      behavioral: 0,
      leadership: 0,
    },
    skillsToImprove: [],
  };

  const completedInterviews = interviews.filter(
    (interview) => interview.status === "completed"
  );
  stats.completedInterviews = completedInterviews.length;

  if (completedInterviews.length === 0) {
    return stats;
  }

  const totalScore = completedInterviews.reduce(
    (acc, Interview) => acc + (Interview.results?.overallScore || 0),
    0
  );

  stats.averageScore =
    Math.round((totalScore / completedInterviews.length) * 10) / 10; // Round to 2 decimal places

  // Calculate average skill scores
  completedInterviews.forEach((interview) => {
    if (interview.results?.skillScores) {
      Object.keys(stats.scores).forEach((skill) => {
        if (interview.results.skillScores[skill]) {
          stats.scores[skill] += interview.results.skillScores[skill];
        }
      });
    }
  });

  Object.keys(stats.scores).forEach((skill) => {
    stats.scores[skill] =
      Math.round((stats.scores[skill] / completedInterviews.length) * 10) / 10; // Round to 2 decimal places
  });

  const skillScores = Object.entries(stats.scores).map(([skill, score]) => ({ skill, score }));
  skillScores.sort((a, b) => a.score - b.score);

  stats.skillsToImprove = skillScores
    .slice(0, 3)
    .filter(item => item.score < 7)
    .map(item => formatSkillName(item.skill));
  
  // If no skills are below threshold, add general improvement suggestion
  if (stats.skillsToImprove.length === 0) {
    stats.skillsToImprove = ['Continue practicing to maintain your skills'];
  }
  
  return stats;
};

const formatSkillName = (skill) => {
    const skillMap = {
        communication: 'Improve communication clarity',
        technical: 'Strengthen technical knowledge',
        problemSolving: 'Enhance problem-solving approach',
        behavioral: 'Work on behavioral responses',
        leadership: 'Develop leadership examples'
    };

    return skillMap[skill] || skill;
};

export default {
  startInterview,
  sendMessage,
  getInterviewHistory,
  getInterviewById,
};