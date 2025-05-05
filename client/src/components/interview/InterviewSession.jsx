import React, { useState, useEffect, useRef } from 'react';
import styles from './InterviewSession.module.css';

export default function InterviewSession({ 
  interviewSettings, 
  interviewData, 
  submitAnswer, 
  nextQuestion,
  isLoading
}) {
  // Extract props
  const { role, difficulty, duration, totalQuestions } = interviewSettings;
  const { questions, responses, currentQuestionIndex } = interviewData;
  
  // Local state
  const [answer, setAnswer] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTotalTimeInSeconds());
  const [showHint, setShowHint] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isQuestionLoading, setIsQuestionLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  
  // Refs
  const answerTextareaRef = useRef(null);
  
  // Track if an answer is already in the responses array
  useEffect(() => {
    if (responses && responses[currentQuestionIndex]) {
      setAnswer(responses[currentQuestionIndex]);
      setIsAnswerSubmitted(true);
    } else {
      setAnswer('');
      setIsAnswerSubmitted(false);
    }
  }, [currentQuestionIndex, responses]);
  
  // Track if question is loading or done loading
  useEffect(() => {
    const currentQuestion = getCurrentQuestion();
    const isLoading = !currentQuestion || 
                      isQuestionLoadingState(currentQuestion.text);
    
    setIsQuestionLoading(isLoading);
    
    // Focus textarea when question is loaded
    if (!isLoading && answerTextareaRef.current) {
      answerTextareaRef.current.focus();
    }
  }, [questions, currentQuestionIndex]);
  
  // Get time in seconds based on duration
  function getTotalTimeInSeconds() {
    const times = {
      short: 5 * 60,
      medium: 10 * 60,
      long: 20 * 60
    };
    return times[duration] || 10 * 60;
  }

  // Format time as mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Check if text indicates a loading state
  function isQuestionLoadingState(text) {
    if (!text) return true;
    
    return text.includes("Generating") || 
           text.includes("preparing") || 
           text.includes("analyzing");
  }

  // Get a random motivational message
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
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Update motivational message when the question changes
  useEffect(() => {
    setMotivationalMessage(getMotivationalMessage());
  }, [currentQuestionIndex]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Handle answer submission
  const handleSubmit = () => {
    // Allow submission even with empty answer if we have an error state
    // to let the user progress past error states
    const hasErrorMessage = getQuestionText().includes("trouble") || 
                            getQuestionText().includes("error");
    
    if ((answer.trim().length === 0 && !hasErrorMessage) || isLoading) return;
    
    // Check for inappropriate content
    const abusivePatterns = /\b(fuck|shit|damn|bitch|asshole|cunt|dick|wtf|stfu)\b/i;
    if (abusivePatterns.test(answer)) {
      setErrorMessage("Please maintain professional language in your responses.");
      setTimeout(() => setErrorMessage(null), 5000); // Clear after 5 seconds
      return;
    }
    
    // Check for very short answers to questions (except the first question)
    if (currentQuestionIndex > 0 && answer.trim().length < 20 && !hasErrorMessage) {
      setFeedbackMessage("Your answer is very brief. Consider providing more details for better feedback.");
      setTimeout(() => setFeedbackMessage(null), 5000); // Clear after 5 seconds
    }
    
    console.log("Submitting answer:", answer.substring(0, 30) + "...");
    setIsAnswerSubmitted(true);
    submitAnswer(answer);
  };

  // Get current question safely
  const getCurrentQuestion = () => {
    // First check if we have questions array and the current index exists
    if (!questions || questions.length === 0 || currentQuestionIndex < 0) {
      return { text: "Preparing your interview question..." };
    }
    
    // Make sure currentQuestionIndex is within bounds
    if (currentQuestionIndex >= questions.length) {
      return { text: "Preparing your interview question..." };
    }
    
    // Return the actual question or a default if it doesn't exist
    return questions[currentQuestionIndex] || { text: "Preparing your interview question..." };
  };

  // Get safe question text
  const getQuestionText = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return "Preparing your interview question...";
    
    // Handle different types: text might be null, undefined, an object, etc.
    let text = "";
    
    if (currentQuestion.text === null || currentQuestion.text === undefined) {
      return "Preparing your interview question...";
    } else if (typeof currentQuestion.text === 'string') {
      text = currentQuestion.text;
    } else if (typeof currentQuestion.text === 'object') {
      // Try to extract text from object
      try {
        text = JSON.stringify(currentQuestion.text);
      } catch (e) {
        text = "Preparing your interview question...";
      }
    } else {
      text = String(currentQuestion.text);
    }
    
    // Remove any emoji that might have slipped through
    text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/ug, '');
    
    // Check for duplicate Rahul mentions in non-first questions
    if (currentQuestionIndex > 0 && text.toLowerCase().includes("rahul")) {
      const patterns = [
        /Hi,?\s+I'm Rahul.*?\./i,
        /Hello,?\s+I'm Rahul.*?\./i,
        /This is Rahul.*?\./i,
        /My name is Rahul.*?\./i,
      ];
      
      for (const pattern of patterns) {
        text = text.replace(pattern, '');
      }
      
      // Fix capitalization after removal
      text = text.trim().replace(/^[a-z]/, match => match.toUpperCase());
    }
    
    // Text shouldn't be empty
    if (!text || text.trim() === '') {
      return "Preparing your interview question...";
    }
    
    return text;
  };

  // Get question type based on role
  const getQuestionType = () => {
    const technicalRoles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer'];
    if (technicalRoles.includes(role)) {
      return 'technical';
    }
    return 'behavioral';
  };

  // Get default hints
  const getHints = () => {
    return [
      "Structure your answer using the STAR method (Situation, Task, Action, Result)",
      "Be specific with examples from your past experience",
      "Quantify your achievements when possible",
      "Focus on your individual contributions"
    ];
  };

  // Calculate progress
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

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
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <span className={styles.questionBadge}>
              Q{currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className={styles.typeBadge}>
              {getQuestionType()}
            </span>
          </div>
          <div className={styles.difficultyBadge}>
            {difficulty} difficulty
          </div>
        </div>
        
        {/* Question display */}
        <div className="mb-6 min-h-[100px]">
          {isQuestionLoading ? (
            <div className="flex items-center space-x-2 mb-4">
              <span>{getQuestionText()}</span>
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-200"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-400"></div>
              </div>
            </div>
          ) : (
            <div className="text-white whitespace-pre-line bg-gray-800 p-4 rounded-lg">
              {getQuestionText().split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < getQuestionText().split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {/* Answer input */}
        <div className="mb-4 sm:mb-6">
          <label className={styles.textareaLabel}>Your Answer:</label>
          <textarea
            ref={answerTextareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAnswerSubmitted || isLoading || isQuestionLoading}
            placeholder={isQuestionLoading ? 
                        "Please wait for the question to be generated..." : 
                        "Type your answer here..."}
            className={isAnswerSubmitted || isLoading || isQuestionLoading ? 
                      styles.textareaDisabled : styles.textarea}
          />
          
          {/* Error message display */}
          {errorMessage && (
            <div className="mt-2 bg-red-900 bg-opacity-20 text-red-400 p-2 rounded-md text-sm">
              <i className="fa-solid fa-exclamation-circle mr-1"></i> {errorMessage}
            </div>
          )}
          
          {/* Feedback message display */}
          {feedbackMessage && !errorMessage && (
            <div className="mt-2 bg-yellow-900 bg-opacity-20 text-yellow-400 p-2 rounded-md text-sm">
              <i className="fa-solid fa-lightbulb mr-1"></i> {feedbackMessage}
            </div>
          )}
          
          {!isAnswerSubmitted && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0">
              <div className={styles.characterCount}>
                <span className={answer.length < 50 && currentQuestionIndex > 0 ? 'text-red-400' : 'text-green-400'}>
                  {answer.length} characters
                </span>
                <span className="hidden sm:inline"> 
                  {currentQuestionIndex === 0 ? 
                    "(brief introduction is fine)" : 
                    "(aim for 100-300 for a complete answer)"}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={answer.trim().length === 0 || isLoading || isQuestionLoading}
                className={
                  isLoading ? styles.loadingButton :
                  answer.trim().length === 0 || isQuestionLoading ? 
                  styles.submitButtonDisabled : styles.submitButton
                }
              >
                {isLoading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i><span>Processing...</span></>
                ) : (
                  <><i className="fa-solid fa-check"></i><span>Submit & Continue</span></>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Loading indicator */}
        {(isLoading || isQuestionLoading) && !isAnswerSubmitted && (
          <div className="flex justify-center items-center p-4 sm:p-8">
            <div className="animate-pulse flex flex-col items-center">
              <i className="fa-solid fa-robot text-blue-400 text-2xl sm:text-4xl mb-3 sm:mb-4"></i>
              <p className="text-blue-300">AI is preparing your interview question...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Side panel - Info (now stacks on mobile) */}
      <div className="space-y-4 sm:space-y-6">
        {/* Interview info card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-5 border border-blue-900">
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
                {currentQuestionIndex + 1} of {totalQuestions}
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
        
        {/* Tips card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-4 sm:p-5 border border-yellow-900">
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
            <div className={`${styles.hintContainer} ${showHint ? styles.hintVisible : styles.hintHidden}`}>
              <div className={styles.hintContent}>
                <p className="text-gray-300 text-sm mb-2">Consider these points:</p>
                <ul className="list-disc list-inside space-y-1">
                  {getHints().map((point, idx) => (
                    <li key={idx} className="text-sm text-yellow-200">{point}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-2 italic">
                  Remember to provide specific examples to support your answer.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm">
              <b className="text-yellow-400">No immediate feedback:</b> Your answers will be analyzed at the end of the interview to provide comprehensive feedback.
            </p>
          )}
          
          {!isAnswerSubmitted && !showHint && (
            <p className="text-gray-300 text-sm">
              {motivationalMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
