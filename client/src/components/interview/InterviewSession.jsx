import React, { useState, useEffect } from 'react'
import styles from './InterviewSession.module.css'

export default function InterviewSession({ 
  interviewSettings, 
  interviewData, 
  submitAnswer, 
  nextQuestion,
  isLoading
}) {
  const { role, difficulty, duration } = interviewSettings
  const { questions, responses, feedback, currentQuestionIndex } = interviewData
  
  const [answer, setAnswer] = useState('')
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(getTotalTimeInSeconds())
  const [showHint, setShowHint] = useState(false)

  // Get time in seconds based on duration
  function getTotalTimeInSeconds() {
    const times = {
      short: 5 * 60,
      medium: 10 * 60,
      long: 20 * 60
    }
    return times[duration] || 10 * 60
  }

  // Format time as mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Choose motivational message
  function getMotivationalMessage() {
    const messages = [
      "You're doing great! Keep going!",
      "Take a deep breath and focus on the question.",
      "Remember to use the STAR method for behavioral questions.",
      "Be specific and use real examples when possible.",
      "You've got this! Stay confident.",
      "Quality over quantity - think before answering.",
      "Showcase your skills and experience through stories.",
      "Focus on your strengths and achievements.",
      "It's okay to take a moment to gather your thoughts."
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Handle answer submission
  const handleSubmit = () => {
    if (answer.trim().length === 0 || isLoading) return
    
    submitAnswer(answer)
    setIsAnswerSubmitted(true)
  }

  // Handle moving to next question
  const handleNext = () => {
    setAnswer('')
    setIsAnswerSubmitted(false)
    setShowHint(false)
    nextQuestion()
  }

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]
  const currentFeedback = feedback[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  // Early return if no questions
  if (!currentQuestion) return <div>Loading questions...</div>

  return (
    <div className={styles.container}>
      {/* Main panel - Interview Questions & Answers */}
      <div className={styles.mainPanel}>
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Question number and type */}
        <div className={styles.questionHeader}>
          <div className="flex items-center gap-2 text-sm">
            <span className={styles.questionBadge}>
              Q{currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className={styles.typeBadge}>
              {currentQuestion.type}
            </span>
          </div>
          <div className={styles.difficultyBadge}>
            {difficulty} difficulty
          </div>
        </div>
        
        {/* Question */}
        <h2 className={styles.question}>
          {currentQuestion.text}
        </h2>
        
        {/* Answer area */}
        <div className="mb-6">
          <label className={styles.textareaLabel}>Your Answer:</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAnswerSubmitted || isLoading}
            placeholder="Type your answer here..."
            className={isAnswerSubmitted || isLoading ? styles.textareaDisabled : styles.textarea}
          />
          
          {!isAnswerSubmitted && (
            <div className="flex justify-between items-center mt-2">
              <div className={styles.characterCount}>
                <span className={answer.length < 50 ? 'text-red-400' : 'text-green-400'}>
                  {answer.length} characters
                </span>
                <span> (aim for 100-300 for a complete answer)</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={answer.trim().length === 0 || isLoading}
                className={
                  isLoading ? styles.loadingButton :
                  answer.trim().length === 0 ? styles.submitButtonDisabled : styles.submitButton
                }
              >
                {isLoading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i><span>Processing...</span></>
                ) : (
                  <><i className="fa-solid fa-check"></i><span>Submit Answer</span></>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Feedback section */}
        {isAnswerSubmitted && currentFeedback && (
          <div className="bg-gray-900 border border-blue-900 rounded-lg p-5 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 font-medium">AI Feedback</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-300 mr-2">Score:</span>
                <span className={`font-medium text-lg ${
                  currentFeedback.score >= 8 ? 'text-green-400' :
                  currentFeedback.score >= 6 ? 'text-blue-400' : 
                  currentFeedback.score >= 4 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {currentFeedback.score}/10
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <h4 className="text-green-400 text-sm font-medium mb-1.5">Strengths:</h4>
                <ul className="list-disc list-inside space-y-1 text-green-200">
                  {currentFeedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </div>
              
              {/* Areas for improvement */}
              <div>
                <h4 className="text-yellow-400 text-sm font-medium mb-1.5">Areas for Improvement:</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-200">
                  {currentFeedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm">{improvement}</li>
                  ))}
                </ul>
              </div>
              
              {/* Key points to include */}
              {currentFeedback.suggestedTopics && currentFeedback.suggestedTopics.length > 0 && (
                <div>
                  <h4 className="text-blue-400 text-sm font-medium mb-1.5">Key points you could have mentioned:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-200">
                    {currentFeedback.suggestedTopics.map((topic, idx) => (
                      <li key={idx} className="text-sm">{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={handleNext}
              className="w-full mt-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"
            >
              <span>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              </span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
        
        {isLoading && !isAnswerSubmitted && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <i className="fa-solid fa-robot text-blue-400 text-4xl mb-4"></i>
              <p className="text-blue-300">AI is analyzing your interview question...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Side panel - Info */}
      <div className="space-y-6">
        {/* Interview info card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-blue-900">
          <h3 className="text-blue-400 font-medium mb-3">Interview Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Role:</span>
              <span className="text-white font-medium">{role}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Difficulty:</span>
              <span className={`font-medium capitalize ${
                difficulty === 'easy' ? 'text-green-400' :
                difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {difficulty}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Progress:</span>
              <span className="text-white font-medium">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex flex-col items-center pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="fa-solid fa-clock text-blue-400"></i>
                <span className="text-gray-300">Time Remaining:</span>
              </div>
              <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hint card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-yellow-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-yellow-400 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb"></i>
              <span>Interview Tip</span>
            </h3>
            {!isAnswerSubmitted && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-yellow-400 underline underline-offset-2"
              >
                {showHint ? 'Hide hint' : 'Show hint'}
              </button>
            )}
          </div>
          
          {!isAnswerSubmitted ? (
            showHint ? (
              <div className="animate-fadeIn">
                <p className="text-gray-300 text-sm mb-2">Consider these points:</p>
                <ul className="list-disc list-inside space-y-1">
                  {currentQuestion.ideaPoints.map((point, idx) => (
                    <li key={idx} className="text-sm text-yellow-200">{point}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-2 italic">
                  Remember to provide specific examples to support your answer.
                </p>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">
                {getMotivationalMessage()}
              </p>
            )
          ) : (
            <div>
              <p className="text-gray-300 text-sm">
                Review your answer and the feedback before proceeding to the next question.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
