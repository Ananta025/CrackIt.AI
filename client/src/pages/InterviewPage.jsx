import React, { useState, useEffect } from 'react';
import InterviewSession from '../components/interview/InterviewSession';
import InterviewSetup from '../components/interview/InterviewSetup';
import ThankYouScreen from '../components/interview/ThankYouScreen';
import InterviewSummary from '../components/interview/InterviewSummary';
import interviewService from '../services/interviewService';
import '../styles/InterviewPage.module.css';

// Interview flow stages
const STAGES = {
  SETUP: 'setup',
  SESSION: 'session',
  THANK_YOU: 'thank_you',
  SUMMARY: 'summary'
};

export default function InterviewPage() {
  const [stage, setStage] = useState(STAGES.SETUP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Interview data
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
    overallScore: 0
  });

  // Start a new interview
  const startInterview = async (settings) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reset interview service tracking
      interviewService.resetTracking();
      
      const { interview } = await interviewService.startInterview('technical', settings);
      
      // Initialize interview data
      setInterviewSettings(settings);
      setInterviewData({
        interviewId: interview._id,
        questions: [{ text: "I'm ready to begin the interview." }],
        responses: [],
        feedback: [],
        currentQuestionIndex: 0
      });
      
      // Start the session
      setStage(STAGES.SESSION);
      
      // Send initial message to get first question
      const response = await interviewService.sendMessage(
        interview._id,
        "I'm ready to begin the interview."
      );
      
      // Update with first question
      setInterviewData(prev => ({
        ...prev,
        questions: [{ text: response.message }]
      }));
      
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
      const { interviewId, currentQuestionIndex, questions } = interviewData;
      
      // Determine if this is the last question
      const isLastQuestion = currentQuestionIndex >= getMaxQuestions(interviewSettings.duration) - 2;
      
      const response = await interviewService.sendMessage(interviewId, answer, {
        isLastQuestion
      });
      
      // Check if interview ended during submission
      if (response.interviewEnded) {
        console.log("Final answer submitted, interview ended");
        // Update responses and feedback first
        setInterviewData(prev => {
          const updatedResponses = [...prev.responses];
          updatedResponses[currentQuestionIndex] = answer;
          
          const updatedFeedback = [...prev.feedback];
          if (response.feedback) {
            updatedFeedback[currentQuestionIndex] = response.feedback;
          }
          
          return {
            ...prev,
            responses: updatedResponses,
            feedback: updatedFeedback
          };
        });
        
        return;
      }
      
      // Update responses and feedback
      setInterviewData(prev => {
        const updatedResponses = [...prev.responses];
        updatedResponses[currentQuestionIndex] = answer;
        
        // Make sure feedback is provided even if there's an error
        const updatedFeedback = [...prev.feedback];
        if (response.feedback) {
          updatedFeedback[currentQuestionIndex] = response.feedback;
        } else {
          // Create fallback feedback if none provided
          updatedFeedback[currentQuestionIndex] = {
            strengths: ["You provided a detailed answer"],
            improvements: ["Consider adding more specific examples"],
            score: 7,
            suggestedTopics: ["Technical implementation details", "Real-world examples"]
          };
        }
        
        return {
          ...prev,
          responses: updatedResponses,
          feedback: updatedFeedback
        };
      });
      
      // Check if interview ended
      if (response.interviewEnded) {
        console.log("Interview ended, will show thank you screen next");
      }
      
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setError("Failed to submit your answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Move to next question
  const nextQuestion = async () => {
    const { interviewId, currentQuestionIndex, questions, responses } = interviewData;
    
    // Determine if this was the last question
    const maxQuestions = getMaxQuestions(interviewSettings.duration);
    if (currentQuestionIndex >= maxQuestions - 1) {
      // Move to thank you screen after last question
      console.log("Last question reached, moving to thank you screen");
      setStage(STAGES.THANK_YOU);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If we already have the next question, just move to it
      if (questions.length > currentQuestionIndex + 1) {
        setInterviewData(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
        setIsLoading(false);
        return;
      }
      
      // Otherwise get next question from service
      const lastAnswer = responses[currentQuestionIndex];
      const response = await interviewService.sendMessage(interviewId, lastAnswer || "Continue");
      
      // Check if interview ended during this request
      if (response.interviewEnded) {
        console.log("Interview ended notification received, moving to thank you screen");
        setStage(STAGES.THANK_YOU);
        return;
      }
      
      // Continue with normal question handling
      if (response && response.message) {
        // Add new question
        setInterviewData(prev => ({
          ...prev,
          questions: [...prev.questions, { text: response.message }],
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      } else {
        // Handle missing response with generic fallback
        const fallbackQuestion = `Based on your previous answer, could you elaborate more on your approach to ${interviewSettings.focus?.[0] || 'this topic'}?`;
        setInterviewData(prev => ({
          ...prev,
          questions: [...prev.questions, { text: fallbackQuestion }],
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
        setError("There was an issue loading the next question. A generic question has been provided.");
      }
    } catch (error) {
      console.error("Failed to get next question:", error);
      
      // Check for specific error about interview being completed
      if (error?.message === 'Interview is not in progress') {
        console.log("Interview is already completed, moving to thank you screen");
        setStage(STAGES.THANK_YOU);
        return;
      }
      
      // Use fallback question when API fails
      const fallbackQuestion = `Could you tell me about your experience with ${interviewSettings.focus?.[0] || 'this technology'}?`;
      setInterviewData(prev => ({
        ...prev,
        questions: [...prev.questions, { text: fallbackQuestion }],
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
      setError("Failed to load the next question. A fallback question has been provided.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go to summary screen from thank you screen
  const goToSummary = async () => {
    setIsLoading(true);
    
    try {
      // Check if we have a valid interview ID
      if (!interviewData.interviewId) {
        setError("Invalid interview ID. Please restart the interview.");
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching interview results for ID:", interviewData.interviewId);
      
      // Get detailed interview data
      let interview = await interviewService.getInterview(interviewData.interviewId);
      
      // If we fail to get interview data, maybe wait a bit and retry
      if (!interview || !interview.results) {
        console.log("Interview results not ready yet, waiting briefly...");
        
        // Small delay to allow backend processing to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try again
        const retryInterview = await interviewService.getInterview(interviewData.interviewId);
        if (retryInterview && retryInterview.results) {
          interview = retryInterview;
        }
      }
      
      if (!interview) {
        throw new Error("Failed to fetch interview data");
      }
      
      console.log("Received interview data:", interview);
      
      // Update interview data with results and ensure proper structure
      setInterviewData(prev => {
        // Create a new object with all the existing data
        const updatedData = {
          ...prev,
          results: interview.results || {},
          overallScore: interview.results?.overallScore || 0
        };
        
        // Ensure feedback array is properly initialized
        if (!Array.isArray(updatedData.feedback)) {
          updatedData.feedback = [];
        }
        
        // Map questions and answers from the fetched interview
        if (interview.questions && Array.isArray(interview.questions)) {
          updatedData.questions = interview.questions.map(q => ({
            text: q.text || "",
            feedback: q.feedback || null
          }));
          
          // Extract responses from the fetched interview
          updatedData.responses = interview.questions.map(q => q.answer || "");
          
          // Extract feedback from the fetched interview
          updatedData.feedback = interview.questions.map(q => q.feedback || null);
        }
        
        return updatedData;
      });
      
      // Move to summary stage
      setStage(STAGES.SUMMARY);
    } catch (error) {
      console.error("Failed to load interview summary:", error);
      setError(`Failed to load your results: ${error.message}. Please try again.`);
      
      // Allow user to retry
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return;
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
      overallScore: 0
    });
  };

  // Retake the same interview
  const retakeInterview = () => {
    startInterview(interviewSettings);
  };

  // Helper function to get max questions based on duration
  const getMaxQuestions = (duration) => {
    switch (duration) {
      case 'short': return 5;
      case 'medium': return 8;
      case 'long': return 12;
      default: return 8;
    }
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
            interviewSettings={interviewSettings}
            interviewData={interviewData}
            submitAnswer={submitAnswer}
            nextQuestion={nextQuestion}
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
    </div>
  );
}
