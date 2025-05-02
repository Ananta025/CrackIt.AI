import React, { useState, useEffect } from 'react'
import styles from './InterviewSummary.module.css'

export default function InterviewSummary({ 
  interviewSettings, 
  interviewData, 
  restartInterview, 
  retakeInterview 
}) {
  const { role = 'Candidate', difficulty = 'medium' } = interviewSettings || {}
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Add debugging to help troubleshoot
  useEffect(() => {
    console.log("InterviewSummary: Data received:", { 
      settings: interviewSettings, 
      data: interviewData 
    });
    
    // Check for common issues
    if (!interviewData) {
      setError("No interview data available");
    } else if (!Array.isArray(interviewData.questions) || interviewData.questions.length === 0) {
      setError("No questions found in the interview data");
    } else if (!Array.isArray(interviewData.responses) || interviewData.responses.length === 0) {
      console.warn("No responses found in interview data");
    } else if (!Array.isArray(interviewData.feedback) || interviewData.feedback.length === 0) {
      console.warn("No feedback found in interview data");
    }
  }, [interviewSettings, interviewData]);
  
  // Safely extract data with fallbacks
  const questions = Array.isArray(interviewData?.questions) ? interviewData.questions : [];
  const responses = Array.isArray(interviewData?.responses) ? interviewData.responses : [];
  const feedback = Array.isArray(interviewData?.feedback) ? interviewData.feedback : [];
  const results = interviewData?.results || {};
  const overallScore = interviewData?.overallScore || 0;
  
  // Handle potential undefined feedback array
  const validFeedback = Array.isArray(feedback) ? feedback : []
  
  // Calculate statistics - add null checks
  const answeredQuestions = validFeedback.filter(f => f !== null && f !== undefined).length
  const highScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.score >= 8).length
  const mediumScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.score >= 5 && f.score < 8).length
  const lowScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.score < 5).length
  
  // Get feedback summary text - use results object if available
  const getFeedbackSummary = () => {
    // If we have a results object with feedback, use that
    if (results && results.feedback) {
      return results.feedback
    }
    
    // Otherwise, generate feedback based on overall score
    const score = overallScore || 0
    if (score >= 8) {
      return "Excellent performance! You're well-prepared for your interview. Your answers were thorough and demonstrated strong knowledge and experience."
    } else if (score >= 6) {
      return "Good job! You have a solid foundation but could improve in some areas. Continue practicing to refine your responses."
    } else if (score >= 4) {
      return "You're making progress, but need more preparation. Focus on addressing the improvement areas highlighted in the feedback."
    } else {
      return "This topic needs significant more study and practice. Review the feedback carefully and work on strengthening your knowledge and communication skills."
    }
  }
  
  // Get performance emoji
  const getPerformanceEmoji = () => {
    if (overallScore >= 8) return <i className="fa-solid fa-smile text-green-400 text-2xl"></i>
    if (overallScore >= 5) return <i className="fa-solid fa-meh text-yellow-400 text-2xl"></i>
    return <i className="fa-solid fa-frown text-red-400 text-2xl"></i>
  }
  
  // Get score color class
  const getScoreColorClass = (score) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-blue-400"
    if (score >= 4) return "text-yellow-400"
    return "text-red-400"
  }
  
  // Get score background class
  const getScoreBgClass = (score) => {
    if (score >= 8) return styles.scoreGreen
    if (score >= 6) return styles.scoreBlue
    if (score >= 4) return styles.scoreYellow
    return styles.scoreRed
  }
  
  // Make sure we have questions to render
  if (error || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-blue-400 mb-4">Interview Results</h2>
        <p className="text-red-400 mb-3">{error || "No interview data available. Please restart the interview."}</p>
        <button 
          onClick={restartInterview}
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Return to Setup
        </button>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <i className="fa-solid fa-chart-bar text-blue-400 text-4xl mb-4"></i>
          <p className="text-blue-300">Preparing your interview results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="md:mr-8 mb-6 md:mb-0 text-center md:text-left">
            <h1 className={styles.title}>
              Interview Complete!
            </h1>
            <p className={styles.subtitle}>
              You've completed your {difficulty} level interview for {role}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg">
              <span className="text-gray-300">Overall Performance:</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${getScoreColorClass(overallScore || 0)}`}>
                  {overallScore || 0}/10
                </span>
                {getPerformanceEmoji()}
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreBgClass(overallScore || 0)} border-2`}>
              <span className="text-4xl font-bold">
                {overallScore || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistics Card */}
      <div className={styles.statisticsCard}>
        <div className="flex items-center gap-2 mb-4">
          <i className="fa-solid fa-chart-bar text-blue-400"></i>
          <h2 className="text-xl font-semibold text-white">Performance Breakdown</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Questions</div>
            <div className="text-2xl font-bold text-white">{answeredQuestions}/{questions.length}</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-green-400 text-sm mb-1">Strong Answers</div>
            <div className="text-2xl font-bold text-green-400">{highScoreQuestions}</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-yellow-400 text-sm mb-1">Average Answers</div>
            <div className="text-2xl font-bold text-yellow-400">{mediumScoreQuestions}</div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-red-400 text-sm mb-1">Weak Answers</div>
            <div className="text-2xl font-bold text-red-400">{lowScoreQuestions}</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg">
          <h3 className="text-blue-300 font-medium mb-2">Summary Feedback</h3>
          <p className="text-gray-200">{getFeedbackSummary()}</p>
        </div>
      </div>
      
      {/* Questions Review */}
      <div className={styles.questionsReviewCard}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Interview Questions & Answers</h2>
          <div className="space-y-2">
            {questions.map((question, index) => {
              // Fix: Safely check if feedback exists for this question
              const questionFeedback = validFeedback[index]
              const hasAnswered = questionFeedback !== null && questionFeedback !== undefined
              
              return (
                <button
                  key={index}
                  className={
                    selectedQuestionIndex === index
                      ? styles.questionButtonSelected
                      : hasAnswered
                        ? styles.questionButtonAnswered
                        : `${styles.questionButton} opacity-50 cursor-not-allowed`
                  }
                  onClick={() => hasAnswered && setSelectedQuestionIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300 truncate">
                      Q{index + 1}: {question.text && question.text.substring(0, 50)}...
                    </span>
                    {hasAnswered && (
                      <span className={`text-sm font-medium ${getScoreColorClass(questionFeedback.score)}`}>
                        {questionFeedback.score}/10
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Fix: Only display feedback panel if feedback exists for the selected question */}
        {validFeedback[selectedQuestionIndex] && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Q{selectedQuestionIndex + 1}: {questions[selectedQuestionIndex]?.text || 'Question not available'}
              </h3>
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h4 className="text-sm text-gray-400 mb-1">Your Answer:</h4>
                <p className="text-gray-200">{responses[selectedQuestionIndex] || 'No response recorded'}</p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-blue-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-blue-400 font-medium">AI Feedback</h4>
                <span className={`px-2.5 py-1 rounded-full ${getScoreBgClass(validFeedback[selectedQuestionIndex].score)} text-sm font-medium`}>
                  Score: {validFeedback[selectedQuestionIndex].score}/10
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Strengths section with safety checks */}
                {validFeedback[selectedQuestionIndex].strengths && (
                  <div>
                    <h5 className="text-green-400 text-sm font-medium mb-1">Strengths:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {validFeedback[selectedQuestionIndex].strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-300">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Improvements section with safety checks */}
                {validFeedback[selectedQuestionIndex].improvements && (
                  <div>
                    <h5 className="text-yellow-400 text-sm font-medium mb-1">Areas for Improvement:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {validFeedback[selectedQuestionIndex].improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-gray-300">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Suggested topics section with safety checks */}
                {validFeedback[selectedQuestionIndex].suggestedTopics && 
                 validFeedback[selectedQuestionIndex].suggestedTopics.length > 0 && (
                  <div>
                    <h5 className="text-blue-400 text-sm font-medium mb-1">Missing Key Points:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {validFeedback[selectedQuestionIndex].suggestedTopics.map((topic, idx) => (
                        <li key={idx} className="text-sm text-gray-300">{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={restartInterview}
          className={styles.secondaryButton}
        >
          <i className="fa-solid fa-home"></i>
          <span>Return to Setup</span>
        </button>
        
        <div className="flex gap-4">
          <button
            onClick={() => {}}
            className={styles.secondaryButton}
          >
            <i className="fa-solid fa-download"></i>
            <span>Save Report</span>
          </button>
          
          <button
            onClick={retakeInterview}
            className={styles.blueButton}
          >
            <i className="fa-solid fa-redo"></i>
            <span>Retake Interview</span>
          </button>
          
          <button
            onClick={restartInterview}
            className={styles.primaryButton}
          >
            <span>Try Different Role</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
      
      {/* Learning Tips */}
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-purple-900">
        <h3 className="text-purple-400 font-medium mb-3">Learning Resources</h3>
        <p className="text-gray-300 text-sm mb-4">
          Based on your performance, here are some resources to help you improve:
        </p>
        
        <div className="space-y-2">
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <h4 className="font-medium text-white">Practice common {role} interview questions</h4>
            <p className="text-sm text-gray-400">Review our comprehensive list of questions and expert answers</p>
          </div>
          
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <h4 className="font-medium text-white">Master the STAR interview technique</h4>
            <p className="text-sm text-gray-400">Learn how to structure your answers effectively</p>
          </div>
          
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <h4 className="font-medium text-white">{role} technical concepts</h4>
            <p className="text-sm text-gray-400">Strengthen your knowledge of key technical concepts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
