import React, { useState, useEffect, useMemo } from 'react'
import styles from './InterviewSummary.module.css'

export default function InterviewSummary({ 
  interviewSettings, 
  interviewData, 
  restartInterview, 
  retakeInterview 
}) {
  const { role = 'Candidate', difficulty = 'medium' } = interviewSettings || {}
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'questions', 'insights'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
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
    } else if (!interviewData.results) {
      console.warn("No results found in interview data");
    }
  }, [interviewSettings, interviewData]);
  
  // Safely extract data with fallbacks
  const questions = Array.isArray(interviewData?.questions) ? interviewData.questions : [];
  const responses = Array.isArray(interviewData?.responses) ? interviewData.responses : [];
  const feedback = Array.isArray(interviewData?.feedback) ? interviewData.feedback : [];
  const results = interviewData?.results || {};
  
  // Handle potential undefined feedback array
  const validFeedback = Array.isArray(feedback) ? feedback : [];
  
  // Calculate statistics based on actual data
  const answeredQuestions = responses.filter(r => r && r.length > 0).length;
  const highScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.rating >= 8).length;
  const mediumScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.rating >= 5 && f.rating < 8).length;
  const lowScoreQuestions = validFeedback.filter(f => f !== null && f !== undefined && f.rating < 5).length;
  
  // Get score directly from results
  const overallScore = results?.overallScore || 0;
  
  // Calculate competency scores from results
  const competencyScores = results?.skillScores || {
    communication: 0,
    technical: 0,
    problemSolving: 0,
    behavioral: 0,
    leadership: 0
  };
  
  // Get strengths and weaknesses from results
  const strengths = results?.strengths || [];
  const weaknesses = results?.weaknesses || [];
  
  // Get STAR coverage from detailed analysis
  const starStats = results?.detailedAnalysis?.starRatings || {
    situation: 0,
    task: 0,
    action: 0,
    result: 0
  };
  
  // Get career insights
  const careerInsights = results?.careerInsights || [];
  
  // Get learning resources
  const learningResources = results?.learningResources || [];
  
  // Create a memoized function to get the most frequent keywords
  const topKeywords = useMemo(() => {
    const keywordFrequency = results?.detailedAnalysis?.keywordFrequency || {};
    return Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }, [results?.detailedAnalysis?.keywordFrequency]);
  
  // Get feedback summary text - use results object if available
  const getFeedbackSummary = () => {
    // If we have a results object with feedback, use that
    if (results && results.feedback) {
      return results.feedback;
    }
    
    // Otherwise, generate feedback based on overall score
    const score = overallScore || 0;
    if (score >= 8) {
      return `Excellent performance! You're well-prepared for your ${role} interview. Your answers were thorough and demonstrated strong knowledge and experience.`;
    } else if (score >= 6) {
      return `Good job! You have a solid foundation in ${role} concepts but could improve in some areas. Continue practicing to refine your responses.`;
    } else if (score >= 4) {
      return `You're making progress as a ${role}, but need more preparation. Focus on addressing the improvement areas highlighted in the feedback.`;
    } else {
      return `This topic needs significant more study and practice for a ${role} position. Review the feedback carefully and work on strengthening your knowledge and communication skills.`;
    }
  };
  
  // Get performance emoji
  const getPerformanceEmoji = () => {
    if (overallScore >= 8) return <i className="fa-solid fa-smile text-green-400 text-2xl"></i>;
    if (overallScore >= 5) return <i className="fa-solid fa-meh text-yellow-400 text-2xl"></i>;
    return <i className="fa-solid fa-frown text-red-400 text-2xl"></i>;
  };
  
  // Get score color class
  const getScoreColorClass = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-blue-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };
  
  // Get score background class
  const getScoreBgClass = (score) => {
    if (score >= 8) return styles.scoreGreen;
    if (score >= 6) return styles.scoreBlue;
    if (score >= 4) return styles.scoreYellow;
    return styles.scoreRed;
  };

  // Make sure we have data to render
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
    );
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
      {/* Navigation Tabs */}
      <div className="flex mb-6 bg-gray-800 rounded-lg overflow-hidden">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`flex-1 py-3 px-4 text-center ${activeTab === 'overview' 
            ? 'bg-gray-700 text-blue-400 font-medium' 
            : 'text-gray-300 hover:bg-gray-700/50'}`}
        >
          <i className="fa-solid fa-gauge-high mr-2"></i>
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('questions')} 
          className={`flex-1 py-3 px-4 text-center ${activeTab === 'questions' 
            ? 'bg-gray-700 text-blue-400 font-medium' 
            : 'text-gray-300 hover:bg-gray-700/50'}`}
        >
          <i className="fa-solid fa-list-check mr-2"></i>
          Questions
        </button>
        <button 
          onClick={() => setActiveTab('insights')} 
          className={`flex-1 py-3 px-4 text-center ${activeTab === 'insights' 
            ? 'bg-gray-700 text-blue-400 font-medium' 
            : 'text-gray-300 hover:bg-gray-700/50'}`}
        >
          <i className="fa-solid fa-lightbulb mr-2"></i>
          Insights
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Header Card */}
          <div className={styles.headerCard}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="md:mr-8 mb-6 md:mb-0 text-center md:text-left w-full md:w-auto">
                <h1 className={styles.title}>
                  Interview Complete!
                </h1>
                <p className={styles.subtitle}>
                  You've completed your {difficulty} level interview for {role}
                </p>
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 rounded-lg text-sm sm:text-base">
                  <span className="text-gray-300">Overall Performance:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg sm:text-xl font-bold ${getScoreColorClass(overallScore)}`}>
                      {overallScore}/10
                    </span>
                    {getPerformanceEmoji()}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center ${getScoreBgClass(overallScore)} border-2`}>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    {overallScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics Card */}
          <div className={styles.statisticsCard}>
            <div className="flex items-center gap-2 mb-4">
              <i className="fa-solid fa-chart-bar text-blue-400"></i>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Performance Breakdown</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                <div className="text-gray-400 text-xs sm:text-sm mb-1">Questions</div>
                <div className="text-xl sm:text-2xl font-bold text-white">{answeredQuestions}/{questions.length}</div>
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

            {/* Competency Scores */}
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Competency Scores</h3>
              <div className="space-y-3">
                {Object.entries(competencyScores).map(([skill, score]) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300 capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`font-medium ${getScoreColorClass(score)}`}>{score}/10</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className={`h-full rounded-full ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900 rounded-lg p-4 border border-green-900">
                <h3 className="text-green-400 font-medium mb-2">Key Strengths</h3>
                {strengths.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {strengths.map((strength, index) => (
                      <li key={index} className="text-gray-300">{strength}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Complete more questions to identify your strengths</p>
                )}
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-yellow-900">
                <h3 className="text-yellow-400 font-medium mb-2">Areas for Improvement</h3>
                {weaknesses.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {weaknesses.map((weakness, index) => (
                      <li key={index} className="text-gray-300">{weakness}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Complete more questions to identify improvement areas</p>
                )}
              </div>
            </div>
            
            {/* STAR Method Analysis */}
            {results?.detailedAnalysis?.starRatings && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">STAR Method Usage</h3>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Situation, Task, Action, Result</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(starStats).map(([component, percentage]) => (
                    <div key={component} className="bg-gray-900 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1 capitalize">{component}</div>
                      <div className={`text-xl font-bold ${percentage > 70 ? 'text-green-400' : percentage > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {percentage}%
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                  Percentages indicate how often each component of the STAR method appeared in your answers.
                </p>
              </div>
            )}

            {/* Top Keywords */}
            {topKeywords.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-2">Top Keywords In Your Answers</h3>
                <div className="flex flex-wrap gap-2">
                  {topKeywords.map((keyword, index) => (
                    <div key={index} className="bg-blue-900 bg-opacity-30 text-blue-300 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className={styles.questionsReviewCard}>
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Interview Questions & Answers</h2>
            <div className="space-y-2">
              {questions.map((question, index) => {
                const questionFeedback = validFeedback[index];
                const hasAnswered = responses[index] && responses[index].length > 0;
                const rating = questionFeedback?.rating || 0;
                
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
                    disabled={!hasAnswered}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300 truncate">
                        Q{index + 1}: {question.text?.substring(0, 50) || "Question unavailable"}...
                      </span>
                      {hasAnswered && (
                        <span className={`text-sm font-medium ${getScoreColorClass(rating)}`}>
                          {rating ? `${rating}/10` : 'N/A'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {responses[selectedQuestionIndex] && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Q{selectedQuestionIndex + 1}: {questions[selectedQuestionIndex]?.text || 'Question not available'}
                </h3>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-sm text-gray-400 mb-1">Your Answer:</h4>
                  <p className="text-gray-200 whitespace-pre-line">{responses[selectedQuestionIndex] || 'No response recorded'}</p>
                </div>
              </div>
              
              {validFeedback[selectedQuestionIndex] ? (
                <div className="bg-gray-900 rounded-lg border border-blue-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-blue-400 font-medium">AI Feedback</h4>
                    <span className={`px-2.5 py-1 rounded-full ${getScoreBgClass(validFeedback[selectedQuestionIndex].rating)} text-sm font-medium`}>
                      Score: {validFeedback[selectedQuestionIndex].rating}/10
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Key Insight */}
                    {validFeedback[selectedQuestionIndex].keyInsight && (
                      <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3 border border-blue-800">
                        <p className="text-blue-200 italic text-sm">
                          {validFeedback[selectedQuestionIndex].keyInsight}
                        </p>
                      </div>
                    )}
                    
                    {/* STAR Method Analysis */}
                    {validFeedback[selectedQuestionIndex].star && (
                      <div>
                        <h5 className="text-white text-sm font-medium mb-2">STAR Method Coverage:</h5>
                        <div className="grid grid-cols-4 gap-1">
                          {Object.entries(validFeedback[selectedQuestionIndex].star).map(([component, status]) => (
                            <div 
                              key={component}
                              className={`text-center rounded-md py-1 px-1 text-xs ${
                                status === 'Present' 
                                  ? 'bg-green-900 bg-opacity-30 text-green-400 border border-green-800' 
                                  : 'bg-red-900 bg-opacity-20 text-red-300 border border-red-900'
                              }`}
                            >
                              <div className="capitalize font-medium">{component}</div>
                              <div>{status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                
                    {/* Strengths section */}
                    {validFeedback[selectedQuestionIndex].strengths && validFeedback[selectedQuestionIndex].strengths.length > 0 && (
                      <div>
                        <h5 className="text-green-400 text-sm font-medium mb-1">Strengths:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {validFeedback[selectedQuestionIndex].strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-gray-300">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Improvements section */}
                    {validFeedback[selectedQuestionIndex].improvements && validFeedback[selectedQuestionIndex].improvements.length > 0 && (
                      <div>
                        <h5 className="text-yellow-400 text-sm font-medium mb-1">Areas for Improvement:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {validFeedback[selectedQuestionIndex].improvements.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-gray-300">{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Suggested topics section */}
                    {validFeedback[selectedQuestionIndex].suggestedTopics && 
                    validFeedback[selectedQuestionIndex].suggestedTopics.length > 0 && (
                      <div>
                        <h5 className="text-blue-400 text-sm font-medium mb-1">Topics to Review:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {validFeedback[selectedQuestionIndex].suggestedTopics.map((topic, idx) => (
                            <li key={idx} className="text-sm text-gray-300">{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400">No feedback available for this answer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <>
          <div className={`${styles.card} relative`}>
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-lightbulb text-white"></i>
            </div>
            
            <div className="ml-6">
              <h2 className="text-xl text-white font-semibold mb-4">Career Insights</h2>
              
              <div className="space-y-4">
                {careerInsights && careerInsights.length > 0 ? (
                  careerInsights.map((insight, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <p className="text-gray-200">{insight}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">Complete more interviews to receive personalized career insights.</p>
                )}
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div className={styles.card}>
            <h2 className="text-xl text-white font-semibold mb-4">Recommended Learning Resources</h2>
            
            <div className="space-y-3">
              {learningResources && learningResources.length > 0 ? (
                learningResources.map((resource, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <span className={`inline-block rounded-full p-2 ${
                          resource.type === 'book' ? 'bg-blue-900 text-blue-400' : 
                          resource.type === 'course' ? 'bg-green-900 text-green-400' : 
                          resource.type === 'article' ? 'bg-yellow-900 text-yellow-400' : 
                          'bg-purple-900 text-purple-400'
                        }`}>
                          <i className={`fa-solid ${
                            resource.type === 'book' ? 'fa-book' : 
                            resource.type === 'course' ? 'fa-graduation-cap' : 
                            resource.type === 'article' ? 'fa-newspaper' : 
                            'fa-video'
                          } text-sm`}></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{resource.title}</h4>
                        <p className="text-gray-400 text-sm mt-0.5">{resource.description}</p>
                        <div className="mt-1.5">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded capitalize">{resource.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <span className="inline-block rounded-full p-2 bg-blue-900 text-blue-400">
                          <i className="fa-solid fa-book text-sm"></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Cracking the Coding Interview</h4>
                        <p className="text-gray-400 text-sm mt-0.5">Comprehensive guide to technical interview preparation</p>
                        <div className="mt-1.5">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Book</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
                    <div className="flex">
                      <div className="mr-4 mt-1">
                        <span className="inline-block rounded-full p-2 bg-green-900 text-green-400">
                          <i className="fa-solid fa-graduation-cap text-sm"></i>
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">STAR Method for Technical Interviews</h4>
                        <p className="text-gray-400 text-sm mt-0.5">Framework for structuring behavioral interview responses</p>
                        <div className="mt-1.5">
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Course</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Plan */}
          <div className={`${styles.card} mt-6`}>
            <h2 className="text-xl text-white font-semibold mb-4">Your Action Plan</h2>
            
            <div className="space-y-3">
              {results?.improvementTips && results.improvementTips.length > 0 ? (
                results.improvementTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center mr-3 mt-0.5 border border-blue-700">
                      <span className="text-blue-300 font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-200">{tip}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Complete your interview to receive a personalized action plan.</p>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-purple-900 bg-opacity-20 border border-purple-800 rounded-lg">
              <h3 className="text-purple-400 text-sm font-medium flex items-center">
                <i className="fa-solid fa-trophy mr-2"></i>
                <span>Pro Tip for {role} Interviews</span>
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                Practice regularly! Studies show that candidates who practice mock interviews are 30% more likely to receive job offers. Focus on explaining your thought process clearly during coding and system design questions.
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={restartInterview}
          className={styles.secondaryButton}
        >
          <i className="fa-solid fa-home"></i>
          <span className="ml-1.5">Return to Setup</span>
        </button>
        
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
          <button
            onClick={() => {
              const printContent = document.createElement('div');
              printContent.innerHTML = `
                <h1 style="font-size: 24px; margin-bottom: 16px;">Interview Summary - ${role}</h1>
                <p>Overall Score: ${overallScore}/10</p>
                <h2 style="font-size: 18px; margin: 16px 0 8px 0;">Feedback Summary</h2>
                <p>${getFeedbackSummary()}</p>
                <h2 style="font-size: 18px; margin: 16px 0 8px 0;">Strengths</h2>
                <ul>${strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                <h2 style="font-size: 18px; margin: 16px 0 8px 0;">Areas for Improvement</h2>
                <ul>${weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                <h2 style="font-size: 18px; margin: 16px 0 8px 0;">Interview Date</h2>
                <p>${new Date().toLocaleDateString()}</p>
              `;
              
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                <head><title>${role} Interview Report</title></head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px;">
                  ${printContent.innerHTML}
                </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }}
            className={styles.secondaryButton}
          >
            <i className="fa-solid fa-download"></i>
            <span className="ml-1.5">Save Report</span>
          </button>
          
          <button
            onClick={retakeInterview}
            className={styles.blueButton}
          >
            <i className="fa-solid fa-redo"></i>
            <span className="ml-1.5">Retake Interview</span>
          </button>
          
          <button
            onClick={restartInterview}
            className={styles.primaryButton}
          >
            <span>Try Different Role</span>
            <i className="fa-solid fa-arrow-right ml-1.5"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
