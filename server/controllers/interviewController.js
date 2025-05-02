import Interview from "../models/interviewModel.js";
import aiService from "../services/interviewService.js";

const startInterview = async (req, res) => {
  const { user, type, settings, userName } = req.body;

  if (!user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!type) {
    return res.status(400).json({ message: "Interview type is required" });
  }

  if (!settings) {
    return res.status(400).json({ message: "Interview settings are required" });
  }

  try {
    // Create new interview with user name for personalization
    const interview = await Interview.create({
      user,
      type,
      settings,
      status: "in-progress",
      userName: userName || req.user?.name || "Candidate" // Store user name for personalization
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

const sendMessage = async (req, res) => {
  try {
    const { message, interviewId, askedQuestions, isLastQuestion } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    // Use the authenticated user ID from the middleware
    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    // Handle completed interviews by sending useful response
    if (interview.status !== "in-progress") {
      const alreadyCompleted = interview.status === "completed";
      
      if (alreadyCompleted) {
        // If interview already has results, tell client to go to summary
        if (interview.results) {
          return res.status(200).json({
            message: "This interview has already been completed. Please view your results.",
            interviewEnded: true,
            hasResults: true
          });
        } else {
          // Interview completed but results still processing
          return res.status(200).json({
            message: "Interview completed, results being processed. Please wait a moment to view your results.",
            interviewEnded: true,
            hasResults: false
          });
        }
      }
      
      // Otherwise, normal error for other statuses
      return res.status(400).json({ 
        message: `Interview is ${interview.status}. Cannot add new messages.`,
        interviewEnded: true
      });
    }

    // Check if this is the first message
    const isFirstMessage = interview.questions.length === 0 && 
                          message.toLowerCase().includes("ready to begin");

    // Track asked questions from client to prevent repetition
    if (!interview.askedQuestions) {
      interview.askedQuestions = [];
    }
    
    if (askedQuestions && Array.isArray(askedQuestions)) {
      // Filter out duplicates before adding
      askedQuestions.forEach(q => {
        if (!interview.askedQuestions.includes(q)) {
          interview.askedQuestions.push(q);
        }
      });
    }

    // Process the user response with our AI service
    let aiResponse;
    try {
      aiResponse = await aiService.processUserResponse(
        message,
        interview.type,
        interview
      );
    } catch (serviceError) {
      console.error("Error in AI service:", serviceError);
      // Provide a fallback response when the AI service fails
      aiResponse = {
        response: `Thank you for your response. Let me ask you another question about ${interview.settings.focus?.[0] || interview.type}. Could you describe a challenging problem you've solved in this area?`,
        feedback: {
          strengths: ["You provided a detailed response", "You addressed the key points"],
          improvements: ["Consider providing more specific examples", "Structure your answers using the STAR method"],
          score: 6,
          suggestedTopics: ["Specific technical challenges", "Problem-solving approach", "Results and impact"]
        },
        lastQuestion: interview.questions.length > 0 ? 
          interview.questions[interview.questions.length - 1].text : 
          "Tell me about your experience"
      };
    }

    if (!aiResponse) {
      return res.status(500).json({ message: "Error processing AI response" });
    }

    // For the first message, we don't store it as an answer but just get the first question
    if (isFirstMessage) {
      // Save the interview with potentially updated askedQuestions
      await interview.save();
      
      return res.json({
        message: aiResponse.response,
        feedback: null,
        interviewEnded: false,
      });
    }

    // Update interview in database with the new question and answer
    interview.questions.push({
      text: interview.questions.length === 0
        ? aiResponse.lastQuestion
        : interview.questions[interview.questions.length - 1].text,
      answer: message,
      feedback: aiResponse.feedback,
    });

    // Check if interview should end based on max questions or explicit request
    const maxQuestions = getMaxQuestions(interview.settings.duration);
    const shouldInterviewEnd = isLastQuestion || interview.questions.length >= maxQuestions;
    
    console.log(`Question count: ${interview.questions.length}, Max: ${maxQuestions}, Should end: ${shouldInterviewEnd}`);

    if (shouldInterviewEnd) {
      interview.status = "completed";
      interview.endTime = new Date();
      interview.duration = Math.round(
        (interview.endTime - interview.startTime) / (1000 * 60)
      );

      // Generate results and clean up context
      interview.results = await aiService.generateInterviewResults(interview);
      aiService.clearInterviewContext(interviewId);
      
      // Signal to client that interview has ended
      aiResponse.interviewEnded = true;
    }

    await interview.save();

    res.json({
      message: aiResponse.response,
      feedback: aiResponse.feedback,
      interviewEnded: shouldInterviewEnd || aiResponse.interviewEnded,
    });
  } catch (error) {
    console.error("Interview error:", error);
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

    res.json({ interview });
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
  if (interview.settings.difficulty) {  // Fixed from diffiulty to difficulty
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

const calculateUserStats = (interviews) => {
  // Initialize stats object
  const stats = {
    totalInterviews: interviews.length,
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

export {
  startInterview,
  sendMessage,
  getInterviewHistory,
  getInterviewById
};