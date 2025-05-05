import Interview from "../models/interviewModel.js";
import interviewService from "../services/interviewService.js";

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
    // Ensure userName is properly sanitized and available
    const updatedSettings = {
      ...settings,
      userName: userName || settings.userName || 'there'
    };
    
    // Log the name being used for debugging
    console.log(`Starting interview for user: ${updatedSettings.userName}`);
    
    const interview = await interviewService.createInterview(
      user,
      type,
      updatedSettings
    );

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
    const { 
      message, 
      interviewId, 
      askedQuestions, 
      isLastQuestion, 
      forceNew,
      questionIndex,
      nextQuestionIndex,
      isFirstQuestion,
      userName // Make sure we capture the userName when sent from client
    } = req.body;

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

    // Initialize questions array if needed
    if (!interview.questions) {
      console.log(`Initializing questions array for interview ${interviewId}`);
      interview.questions = [];
      await interview.save();
    }
    
    // Determine if this is the first message
    const isActualFirstMessage = isFirstQuestion || interview.questions.length === 0;
    
    // Track asked questions from client to prevent repetition
    let currentAskedQuestions = Array.isArray(askedQuestions) ? askedQuestions : [];
    
    // Determine current question index based on input or current state
    // This is important for the sequential question numbering
    const currentQuestionIdx = questionIndex !== null ? 
      questionIndex : 
      Math.max(0, interview.questions.length - 1);
    
    console.log(`Processing message for question ${currentQuestionIdx + 1}, forceNew=${forceNew}, isFirstMessage=${isActualFirstMessage}`);
    
    // Use the firstName from the request if available
    if (userName && interview.settings) {
      // Update interview settings with the latest name if needed
      if (userName !== interview.settings.userName) {
        interview.settings.userName = userName;
        await interview.save();
        console.log(`Updated interview ${interviewId} with user name: ${userName}`);
      }
    }
    
    try {
      // Process answer if not first message, not forcing a new question
      let answerAnalysis = null;
      if (!isActualFirstMessage && !forceNew) {
        console.log(`Processing answer for question ${currentQuestionIdx + 1}`);
        
        // Add validation to ensure question exists
        if (currentQuestionIdx >= interview.questions.length || 
            !interview.questions[currentQuestionIdx]?.text) {
          
          // Create placeholder question if needed
          if (currentQuestionIdx >= interview.questions.length) {
            while (interview.questions.length <= currentQuestionIdx) {
              interview.questions.push({
                text: "Untitled question",
                status: 'generated'
              });
            }
          } else if (!interview.questions[currentQuestionIdx].text) {
            interview.questions[currentQuestionIdx].text = "Untitled question";
            interview.questions[currentQuestionIdx].status = 'generated';
          }
          
          // Save the interview with placeholders
          await interview.save();
        }
        
        // Process the answer and capture the analysis
        const processResult = await interviewService.processAnswer(interviewId, message, currentQuestionIdx);
        answerAnalysis = processResult.answerAnalysis;
      } else if (isActualFirstMessage) {
        // For the first question, still analyze the message to use it in the second question
        const dummyQuestion = "introduce yourself";
        // Ensure we're getting a complete analysis with all extracted information
        answerAnalysis = await interviewService.analyzeIntroduction(message, dummyQuestion);
        console.log("Analyzed introduction:", answerAnalysis);
      }
      
      // If this is the last question, wrap up the interview
      if (isLastQuestion) {
        const finalResponse = await interviewService.generateQuestion(
          interview,
          message,
          currentAskedQuestions,
          true // This is the last question
        );
        
        // Generate the final results
        await interviewService.generateResults(interviewId);
        
        return res.status(200).json({
          message: finalResponse.message,
          interviewEnded: true,
          hasResults: true
        });
      }
      
      // Generate next question with explicit target index if provided
      const targetQuestionIndex = nextQuestionIndex !== null ? 
        nextQuestionIndex : 
        (forceNew ? currentQuestionIdx : currentQuestionIdx + 1);
      
      console.log(`Generating question at index ${targetQuestionIndex}`);
      
      // Make sure to pass the answer analysis to the generateQuestion function
      const nextResponse = await interviewService.generateQuestion(
        interview,
        message,
        currentAskedQuestions,
        false, // Not last question
        targetQuestionIndex, // Pass the explicit target question index
        answerAnalysis // Pass the answer analysis
      );
      
      // Return with improved response data
      return res.status(200).json({
        message: nextResponse.message,
        questionIndex: nextResponse.questionIndex, // Return the question index
        nextQuestionIndex: nextResponse.questionIndex + 1, // Help client track next index
        feedback: null, // No feedback during interview
        interviewEnded: false
      });
    } catch (processingError) {
      // Special handling for question not found errors - return a more actionable error
      if (processingError.message && processingError.message.includes("not found or not generated")) {
        console.error("Question not found error:", processingError.message);
        
        return res.status(400).json({
          message: processingError.message,
          error: "QUESTION_NOT_FOUND",
          suggestion: "Force new question generation" 
        });
      }
      
      // Rethrow other errors
      throw processingError;
    }
    
  } catch (error) {
    console.error("Interview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get interview history for a user
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await interviewService.getInterviewHistory(req.user._id);

    // Transform interviews for frontend if needed
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
    const interviewId = req.params.id;
    
    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: "Authentication failed", 
        error: "User not authenticated"
      });
    }
    
    console.log(`Getting interview ${interviewId} for user ${req.user._id}`);
    
    // Get interview with potential error catching
    let interview;
    try {
      interview = await interviewService.getInterviewById(interviewId);
      
      if (!interview) {
        return res.status(404).json({
          message: `Interview with ID ${interviewId} not found`
        });
      }
    }
    catch (fetchError) {
      console.error("Error fetching interview:", fetchError);
      return res.status(404).json({
        message: `Failed to retrieve interview: ${fetchError.message}`
      });
    }

    // Check if interview belongs to this user - with more robust error handling
    if (!interview.user || interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        error: 'You do not have permission to access this interview'
      });
    }
    
    res.json({ interview });
  } catch (error) {
    console.error("Interview detail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper Functions

const calculateDuration = (interview) => {
  // If the interview has a stored duration, use it
  if (interview.duration) {
    return interview.duration;
  }
  
  // If interview has both start and end time, calculate duration in minutes
  if (interview.startTime && interview.endTime) {
    return Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / (1000 * 60));
  }
  
  // For in-progress interviews, calculate time elapsed so far
  if (interview.startTime) {
    return Math.round((new Date() - new Date(interview.startTime)) / (1000 * 60));
  }
  
  // Default duration if no timing information is available
  return 0;
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
  if (interview.settings.difficulty) {
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
    (acc, interview) => acc + (interview.results?.overallScore || 0),
    0
  );

  stats.averageScore =
    Math.round((totalScore / completedInterviews.length) * 10) / 10; // Round to 1 decimal place

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
      Math.round((stats.scores[skill] / completedInterviews.length) * 10) / 10; // Round to 1 decimal place
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