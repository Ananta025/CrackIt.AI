import React, { useState } from 'react'
import InterviewSetup from '../components/interview/InterviewSetup'
import InterviewSession from '../components/interview/InterviewSession'
import InterviewSummary from '../components/interview/InterviewSummary'
import styles from '../styles/InterviewPage.module.css'
import interviewService from '../services/interviewService'
import { useNavigate } from 'react-router-dom'

export default function InterviewPage() {
  // Interview states
  const [stage, setStage] = useState('setup') // 'setup', 'session', 'summary'
  const [interviewSettings, setInterviewSettings] = useState({
    role: '',
    difficulty: 'medium',
    duration: 'medium',
    focus: []
  })
  const [interviewData, setInterviewData] = useState({
    questions: [],
    responses: [],
    feedback: [],
    currentQuestionIndex: 0,
    overallScore: 0,
    interviewId: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Start the interview with the selected settings
  const startInterview = async (settings) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Convert role to interview type
      const interviewType = getInterviewType(settings.role)
      
      // Prepare settings object for the API
      const apiSettings = {
        difficulty: settings.difficulty,
        duration: settings.duration,
        focus: settings.focus || []
      }
      
      // Start interview on server
      const result = await interviewService.startInterview(interviewType, apiSettings)
      
      // Set up the initial interview data
      setInterviewData({
        questions: [{ text: "Loading your first question..." }],
        responses: [],
        feedback: [],
        currentQuestionIndex: 0,
        overallScore: 0,
        interviewId: result.interview._id
      })
      
      setInterviewSettings(settings)
      setStage('session')
      
      // Get the first question by sending an empty message to trigger the interview start
      const firstMessage = await interviewService.sendMessage(
        result.interview._id,
        "I'm ready to begin the interview."
      )
      
      // Update with the first question
      setInterviewData(prev => ({
        ...prev,
        questions: [{ text: firstMessage.message }]
      }))
      
    } catch (err) {
      console.error('Error starting interview:', err)
      setError(err.message || 'Failed to start interview')
      
      // Check if error is authentication related
      if (err.requiresAuth) {
        navigate('/signin', { 
          state: { 
            from: '/interview', 
            message: 'Please sign in to use the mock interview feature'
          } 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Submit an answer to the current question
  const submitAnswer = async (answer) => {
    const { currentQuestionIndex, questions, interviewId } = interviewData
    
    try {
      setIsLoading(true)
      
      // Send the answer to the server
      const result = await interviewService.sendMessage(interviewId, answer)
      
      // Update the interview data with the response and feedback
      setInterviewData(prev => {
        const newResponses = [...prev.responses]
        newResponses[currentQuestionIndex] = answer
        
        const newFeedback = [...prev.feedback]
        newFeedback[currentQuestionIndex] = result.feedback
        
        // Add the next question if the interview hasn't ended
        const newQuestions = [...prev.questions]
        if (!result.interviewEnded) {
          newQuestions.push({ text: result.message })
        }
        
        return {
          ...prev,
          responses: newResponses,
          feedback: newFeedback,
          questions: newQuestions,
        }
      })
      
      // If interview ended, fetch the complete interview to get the results
      if (result.interviewEnded) {
        try {
          const interview = await interviewService.getInterview(interviewId)
          
          setInterviewData(prev => ({
            ...prev,
            overallScore: interview.results?.overallScore || 0,
            results: interview.results || {}
          }))
          
          // Move to summary screen when interview ends
          setStage('summary')
        } catch (fetchError) {
          console.error('Error fetching complete interview:', fetchError)
          setError('Failed to load interview results')
        }
      }
      
    } catch (err) {
      console.error('Error submitting answer:', err)
      setError(err.message || 'Failed to submit your answer')
    } finally {
      setIsLoading(false)
    }
  }

  // Move to the next question
  const nextQuestion = () => {
    setInterviewData(prev => {
      // If there are no more questions, move to the summary
      if (prev.currentQuestionIndex >= prev.questions.length - 2) {
        setStage('summary')
        return prev
      }
      
      // Otherwise, move to the next question
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }
    })
  }

  // Restart the interview process
  const restartInterview = () => {
    setStage('setup')
    setInterviewSettings({
      role: '',
      difficulty: 'medium',
      duration: 'medium',
      focus: []
    })
    setInterviewData({
      questions: [],
      responses: [],
      feedback: [],
      currentQuestionIndex: 0,
      overallScore: 0,
      interviewId: null
    })
  }

  // Retake the same interview
  const retakeInterview = async () => {
    // Keep the same settings but start a new interview
    try {
      await startInterview(interviewSettings)
    } catch (err) {
      console.error('Error restarting interview:', err)
      setError(err.message || 'Failed to restart interview')
    }
  }

  // Helper function to convert role to interview type
  const getInterviewType = (role) => {
    const technicalRoles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Mobile Developer', 'QA Engineer', 'Machine Learning Engineer']
    const behavioralRoles = ['Product Manager', 'UI/UX Designer']
    
    if (technicalRoles.includes(role)) return 'technical'
    if (behavioralRoles.includes(role)) return 'behavioral'
    return 'hr' // Default for other roles
  }

  // Render the appropriate stage
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {stage === 'setup' && (
          <div className={`${styles.setupContainer} ${styles.stageTransition}`}>
            <InterviewSetup 
              startInterview={startInterview} 
              initialSettings={interviewSettings}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {stage === 'session' && (
          <div className={`${styles.sessionContainer} ${styles.stageTransition}`}>
            <InterviewSession 
              interviewSettings={interviewSettings}
              interviewData={interviewData}
              submitAnswer={submitAnswer}
              nextQuestion={nextQuestion}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {stage === 'summary' && (
          <div className={`${styles.summaryContainer} ${styles.stageTransition}`}>
            <InterviewSummary 
              interviewSettings={interviewSettings}
              interviewData={interviewData}
              restartInterview={restartInterview}
              retakeInterview={retakeInterview}
            />
          </div>
        )}
      </div>
    </div>
  )
}
