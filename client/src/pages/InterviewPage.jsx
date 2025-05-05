import React, { useState, useEffect, useCallback } from 'react';
import InterviewSession from '../components/interview/InterviewSession';
import InterviewSetup from '../components/interview/InterviewSetup';
import ThankYouScreen from '../components/interview/ThankYouScreen';
import InterviewSummary from '../components/interview/InterviewSummary';
import interviewService from '../services/interviewService';
// import Loading from '../components/common/Loading';
// import ErrorAlert from '../components/common/ErrorAlert';
import '../styles/InterviewPage.module.css';

// Interview flow stages
const STAGES = {
  SETUP: 'setup',
  SESSION: 'session',
  THANK_YOU: 'thank_you',
  SUMMARY: 'summary'
};

export default function InterviewPage() {
  // Core state
  const [stage, setStage] = useState(STAGES.SETUP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Interview settings and data
  const [interviewSettings, setInterviewSettings] = useState({
    role: '',
    difficulty: 'medium',
    duration: 'medium',
    focus: []
  });
  
  const [interviewData, setInterviewData] = useState({
    interviewId: null,
    questions: [],
    responses: [],
    feedback: [],
    currentQuestionIndex: 0,
    results: null,
    overallScore: 0,
    maxQuestions: 8 // Default
  });
  
  // Calculate max questions based on duration
  const getMaxQuestions = useCallback((duration) => {
    const questionCounts = {
      'short': 5,
      'medium': 8,
      'long': 12
    };
    return questionCounts[duration] || 8;
  }, []);
  
  // Start a new interview
  const startInterview = async (settings) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset interview service
      interviewService.resetTracking();
      
      const { interview } = await interviewService.startInterview('technical', settings);
      console.log("Interview started with ID:", interview._id);
      
      // Calculate max questions based on duration
      const maxQuestions = getMaxQuestions(settings.duration);
      
      // Save settings
      setInterviewSettings(settings);
      
      // Initialize interview data with empty array for questions
      setInterviewData({
        interviewId: interview._id,
        questions: [], // Start with an empty array instead of pre-filling
        responses: [],
        feedback: [],
        currentQuestionIndex: 0,
        results: null,
        overallScore: 0,
        maxQuestions
      });
      
      // Change to session stage
      setStage(STAGES.SESSION);
      
      // Request first question
      console.log("Requesting first question...");
      try {
        const response = await interviewService.sendMessage(
          interview._id,
          "I'm ready to begin the interview.",
          { 
            isFirstQuestion: true, 
            questionIndex: 0,
            forceNew: true // Force new to ensure we get a question
          }
        );
        
        // Update first question
        setInterviewData(prev => {
          // Create a new array with just the first question
          const newQuestions = [{ text: response.message }];
          
          return {
            ...prev,
            questions: newQuestions
          };
        });
      } catch (firstQuestionError) {
        console.error("Error getting first question:", firstQuestionError);
        
        // Still show the interview screen but with an error message as the question
        setInterviewData(prev => ({
          ...prev,
          questions: [{ 
            text: "There was an issue loading your first question. Please click 'Submit & Continue' to try again." 
          }]
        }));
      }
      
    } catch (error) {
      console.error("Failed to start interview:", error);
      setError("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Submit answer to current question
  const submitAnswer = async (answer) => {
    setIsLoading(true);
    
    try {
      const { interviewId, currentQuestionIndex, questions, maxQuestions } = interviewData;
      console.log(`Submitting answer for question ${currentQuestionIndex + 1}:`, answer.substring(0, 30) + "...");
      
      // Store answer in state immediately
      setInterviewData(prev => {
        const newResponses = [...prev.responses];
        newResponses[currentQuestionIndex] = answer;
        
        return {
          ...prev,
          responses: newResponses
        };
      });
      
      // Check if this is potentially the last question
      const isLastQuestion = currentQuestionIndex >= maxQuestions - 2;
      
      // Send answer to server with explicit error handling
      try {
        const response = await interviewService.sendMessage(interviewId, answer, {
          isLastQuestion,
          questionIndex: currentQuestionIndex,
          forceNew: false
        });
        
        // Check if interview ended
        if (response.interviewEnded) {
          console.log("Final answer submitted, interview ended");
          setStage(STAGES.THANK_YOU);
          return;
        }
        
        // Handle error response from our custom error handler
        if (response.error) {
          console.log("Error detected in response, will try to recover on next question");
        }
        
        // Proceed to next question regardless
        await goToNextQuestion();
      }
      catch (submissionError) {
        console.error("Error submitting answer:", submissionError);
        
        // Still try to proceed to the next question
        await goToNextQuestion();
      }
      
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setError("Failed to submit your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Move to next question
  const goToNextQuestion = async () => {
    const { interviewId, currentQuestionIndex, maxQuestions } = interviewData;
    
    console.log(`Moving to next question. Current index: ${currentQuestionIndex}, Max: ${maxQuestions}`);
    
    // Check if we've reached the end
    if (currentQuestionIndex >= maxQuestions - 1) {
      console.log("Last question reached, moving to thank you screen");
      setStage(STAGES.THANK_YOU);
      return;
    }
    
    // Calculate next question index
    const nextIndex = currentQuestionIndex + 1;
    
    // First, update UI to show we're moving to next question
    setInterviewData(prev => {
      // Create or update questions array if needed
      const newQuestions = [...prev.questions];
      
      // Add placeholder if needed
      while (newQuestions.length <= nextIndex) {
        newQuestions.push({ text: null });
      }
      
      // Set placeholder for the next question
      newQuestions[nextIndex] = { text: "Generating your next interview question..." };
      
      return {
        ...prev,
        questions: newQuestions,
        currentQuestionIndex: nextIndex
      };
    });
    
    setIsLoading(true);
    
    try {
      // Request next question from server with explicit index
      console.log(`Requesting question for index ${nextIndex}`);
      
      const response = await interviewService.sendMessage(
        interviewId, 
        `Generate question ${nextIndex + 1}`, {
          forceNew: true, // Always force new for next questions
          questionIndex: nextIndex, // Explicitly set question index
          nextQuestionIndex: nextIndex // Also set next question index
        }
      );
      
      // Handle interview end edge case
      if (response.interviewEnded) {
        console.log("Interview ended notification received");
        setStage(STAGES.THANK_YOU);
        return;
      }
      
      // Update question
      setInterviewData(prev => {
        const newQuestions = [...prev.questions];
        newQuestions[nextIndex] = { text: response.message };
        
        console.log(`Updated question ${nextIndex + 1}:`, response.message.substring(0, 50) + "...");
        
        return {
          ...prev,
          questions: newQuestions
        };
      });
      
    } catch (error) {
      console.error("Failed to get next question:", error);
      
      // Check for "interview completed" error
      if (error?.message?.includes('Interview is not in progress')) {
        setStage(STAGES.THANK_YOU);
        return;
      }
      
      // Show error in the question
      setInterviewData(prev => {
        const newQuestions = [...prev.questions];
        newQuestions[nextIndex] = { 
          text: "We're having trouble connecting to our AI. Please submit this answer to try again."
        };
        
        return {
          ...prev,
          questions: newQuestions
        };
      });
      
      setError("Failed to load the next question. Please try submitting the empty answer to continue.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Go to summary screen from thank you screen
  const goToSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!interviewData.interviewId) {
        throw new Error("Interview ID not found. Please restart.");
      }
      
      console.log("Fetching interview results for ID:", interviewData.interviewId);
      
      // Get full interview data with robust error handling
      let interview = null;
      try {
        interview = await interviewService.getInterview(interviewData.interviewId);
      } catch (initialError) {
        console.log("First attempt to get results failed:", initialError.message);
        
        // Wait a bit and retry once
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          interview = await interviewService.getInterview(interviewData.interviewId);
        } catch (retryError) {
          console.error("Retry also failed:", retryError.message);
          throw new Error(`Could not retrieve interview results: ${retryError.message}`);
        }
      }
      
      if (!interview) {
        throw new Error("Failed to fetch interview data");
      }
      
      // Quick verification that we have the expected data
      if (!interview.questions || !Array.isArray(interview.questions)) {
        console.warn("Interview has no questions array:", interview);
        
        // Create a placeholder structure for the UI
        interview.questions = interviewData.questions.map((q, i) => ({
          text: q.text || `Question ${i+1}`,
          answer: interviewData.responses[i] || "",
          feedback: null
        }));
      }
      
      console.log("Received interview data:", interview._id);
      
      // Update interview data with results
      setInterviewData(prev => {
        // Map questions, answers and feedback from server data
        const updatedData = {
          ...prev,
          results: interview.results || {},
          overallScore: interview.results?.overallScore || 5 // Default to middle score
        };
        
        // Map questions data
        if (interview.questions && Array.isArray(interview.questions)) {
          updatedData.questions = interview.questions.map(q => ({
            text: q.text || "Question not available",
            feedback: q.feedback || null
          }));
          
          updatedData.responses = interview.questions.map(q => q.answer || "No response recorded");
          updatedData.feedback = interview.questions.map(q => q.feedback || null);
        }
        
        return updatedData;
      });
      
      // Move to summary stage
      setStage(STAGES.SUMMARY);
      
    } catch (error) {
      console.error("Failed to load interview summary:", error);
      setError(`Failed to load your results: ${error.message}. Please try again.`);
      
      // Keep user on thank you screen but with error message
      throw error; // Re-throw to be caught by ThankYouScreen
    } finally {
      setIsLoading(false);
    }
  };
  
  // Restart interview (go back to setup)
  const restartInterview = () => {
    setStage(STAGES.SETUP);
    setInterviewData({
      interviewId: null,
      questions: [],
      responses: [],
      feedback: [],
      currentQuestionIndex: 0,
      results: null,
      overallScore: 0,
      maxQuestions: 8
    });
  };
  
  // Retake the same interview
  const retakeInterview = () => {
    startInterview(interviewSettings);
  };
  
  // Render the current stage
  const renderStage = () => {
    switch (stage) {
      case STAGES.SETUP:
        return (
          <InterviewSetup 
            startInterview={startInterview} 
            initialSettings={interviewSettings}
            isLoading={isLoading} 
          />
        );
      case STAGES.SESSION:
        return (
          <InterviewSession 
            interviewSettings={{
              ...interviewSettings,
              totalQuestions: interviewData.maxQuestions
            }}
            interviewData={interviewData}
            submitAnswer={submitAnswer}
            nextQuestion={goToNextQuestion}
            isLoading={isLoading}
          />
        );
      case STAGES.THANK_YOU:
        return (
          <ThankYouScreen 
            goToSummary={goToSummary}
          />
        );
      case STAGES.SUMMARY:
        return (
          <InterviewSummary 
            interviewSettings={interviewSettings}
            interviewData={interviewData}
            restartInterview={restartInterview}
            retakeInterview={retakeInterview}
          />
        );
      default:
        return <div>Something went wrong. Please refresh the page.</div>;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl bg-[#121212]">
      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg text-sm sm:text-base">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-300 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="my-2 sm:my-4">
        {renderStage()}
      </div>
      
      {/* Global loading overlay for critical operations */}
      {isLoading && stage === STAGES.THANK_YOU && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-blue-300">Analyzing your interview responses...</p>
          </div>
        </div>
      )}
    </div>
  );
}
