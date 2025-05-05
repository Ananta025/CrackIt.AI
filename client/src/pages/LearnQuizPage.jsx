import React, { useState, useEffect } from 'react';
import { FaSearch, FaBookOpen, FaQuestionCircle, FaSpinner } from 'react-icons/fa';
import learnQuizService from '../services/learnQuizService';
import styles from '../styles/LearnQuizPage.module.css';

export default function LearnQuizPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState('learn'); // 'learn' or 'quiz'
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading
  const [hasSearched, setHasSearched] = useState(false);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const [learnContent, setLearnContent] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [topicId, setTopicId] = useState(null);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setTopic(searchQuery);
    setHasSearched(true);
    setError(null);
    
    // Reset states
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResults(null);
    
    try {
      // Search for the topic
      const searchResults = await learnQuizService.searchTopics(searchQuery);
      
      if (searchResults && searchResults.length > 0) {
        // Use the first matching result's ID
        const bestMatch = searchResults[0];
        setTopicId(bestMatch._id);
        
        if (activeMode === 'learn') {
          // Fetch learning content using ID
          const content = await learnQuizService.getTopicContent(bestMatch._id);
          setLearnContent({
            title: content.name,
            content: content.content // This is the AI-generated content
          });
        } else {
          // Generate quiz using matched topic name
          const quiz = await learnQuizService.generateQuiz(bestMatch.name);
          prepareQuizData(quiz);
        }
      } else {
        // If no exact match, try with the raw search term
        if (activeMode === 'learn') {
          try {
            // Try direct topic content generation
            const content = await learnQuizService.getTopicContent(searchQuery);
            setLearnContent({
              title: content.name || searchQuery,
              content: content.content
            });
          } catch (e) {
            setError(`Unable to find learning content for "${searchQuery}". Try a different search term.`);
          }
        } else {
          // Generate quiz directly with the search term
          try {
            const quiz = await learnQuizService.generateQuiz(searchQuery);
            prepareQuizData(quiz);
          } catch (e) {
            setError(`Unable to create quiz for "${searchQuery}". Try a different search term.`);
          }
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.error || 'Failed to fetch content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between learn and quiz modes
  useEffect(() => {
    if (hasSearched && topic) {
      handleModeSwitch();
    }
  }, [activeMode]);

  const handleModeSwitch = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (activeMode === 'learn') {
        // Fetch learning content
        const content = topicId 
          ? await learnQuizService.getTopicContent(topicId)
          : await learnQuizService.getTopicContent(topic);
        
        setLearnContent({
          title: content.name || topic,
          content: content.content
        });
      } else {
        // Generate quiz
        const quiz = await learnQuizService.generateQuiz(topic);
        prepareQuizData(quiz);
      }
    } catch (err) {
      console.error('Mode switch error:', err);
      setError(err.error || 'Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare quiz data from API response
  const prepareQuizData = (apiQuizData) => {
    if (!apiQuizData || !apiQuizData.questions) {
      setError('Failed to generate quiz questions');
      return;
    }
    
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizResults(null);
    
    setQuizData(apiQuizData);
  };

  // Handle quiz navigation
  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      // Convert selectedAnswers object to array format expected by API
      const answersArray = Object.entries(selectedAnswers)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([_, value]) => value);
      
      // Submit answers to backend
      const results = await learnQuizService.submitQuiz(
        answersArray, 
        topic,
        topicId
      );
      
      // Ensure loading spinner shows for at least 1.5 seconds for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQuizResults(results);
      setShowResults(true);
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(err.error || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Render Learn Content
  const renderLearnContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading learning materials...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.tryAgainButton}>
            Try Again
          </button>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <FaBookOpen />
          </div>
          <p className={styles.emptyStateText}>
            Search for any topic above to start learning
          </p>
        </div>
      );
    }

    if (!learnContent) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            No content found for "{topic}". Try another search term.
          </p>
        </div>
      );
    }

    return (
      <div className={styles.learningContent}>
        <h2>{learnContent.title}</h2>
        
        {/* Display explanation content */}
        {learnContent.content && (
          <div>
            {learnContent.content.explanation && (
              <div>
                <h3>Overview</h3>
                <p>{learnContent.content.explanation}</p>
              </div>
            )}
            
            {/* Key Concepts */}
            {learnContent.content.keyConcepts && learnContent.content.keyConcepts.length > 0 && (
              <div>
                <h3>Key Concepts</h3>
                {learnContent.content.keyConcepts.map((concept, i) => (
                  <div key={i}>
                    <h4>{concept.name}</h4>
                    <p>{concept.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Examples */}
            {learnContent.content.examples && learnContent.content.examples.length > 0 && (
              <div>
                <h3>Examples</h3>
                {learnContent.content.examples.map((example, i) => (
                  <div key={i}>
                    <h4>{example.title}</h4>
                    <p>{example.description}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Code Examples */}
            {learnContent.content.codeExamples && learnContent.content.codeExamples.length > 0 && (
              <div>
                <h3>Code Examples</h3>
                {learnContent.content.codeExamples.map((codeExample, i) => (
                  <div key={i}>
                    <h4>{codeExample.description}</h4>
                    <div className={styles.codeBlock}>
                      <pre>{codeExample.code}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Interview Tips */}
            {learnContent.content.interviewTips && learnContent.content.interviewTips.length > 0 && (
              <div className={styles.infoCard}>
                <h3>Interview Tips</h3>
                <ul>
                  {learnContent.content.interviewTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.infoCard}>
          <p><strong>Pro Tip:</strong> Practice makes perfect! After learning, switch to Quiz mode to test your knowledge.</p>
        </div>
      </div>
    );
  };

  // Render Quiz Content
  const renderQuizContent = () => {
    // Show loading state either during initial loading or when submitting answers
    if (isLoading || isSubmitting) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>
            {isSubmitting ? "Analyzing your results..." : "Preparing quiz questions..."}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.tryAgainButton}>
            Try Again
          </button>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <FaQuestionCircle />
          </div>
          <p className={styles.emptyStateText}>
            Search for any topic above to take a quiz
          </p>
        </div>
      );
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            No quiz available for "{topic}". Try another search term.
          </p>
        </div>
      );
    }

    if (showResults && quizResults) {
      return (
        <div className={styles.resultContainer}>
          <h2>Quiz Results</h2>
          <div className={styles.resultScore}>{quizResults.score}%</div>
          <p className={styles.resultMessage}>
            {quizResults.score >= 80 
              ? "Great job! You've mastered this topic." 
              : quizResults.score >= 50 
                ? "Good effort! You're on the right track." 
                : "Keep studying! You'll improve with practice."}
          </p>

          <button 
            className={`${styles.quizButton} ${styles.smallButton}`}
            onClick={() => {
              setShowResults(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
            }}
          >
            Try Again
          </button>

          <div className={styles.resultDetails}>
            <h3>Review:</h3>
            {quizResults.questions && quizResults.questions.map((item, index) => (
              <div key={index} className={styles.resultQuestionItem}>
                <p className={styles.resultQuestionText}>{index + 1}. {item.question}</p>
                <p className={item.isCorrect ? styles.resultAnswerCorrect : styles.resultAnswerIncorrect}>
                  Your answer: {item.userAnswer !== undefined ? quizData.questions[index].answers[item.userAnswer] : 'Not answered'}
                  {!item.isCorrect && 
                    ` (Correct: ${quizData.questions[index].answers[item.correctAnswer]})`}
                </p>
                <p className={styles.resultExplanation}>{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    
    return (
      <div className={styles.quizContainer}>
        <div className={styles.questionCounter}>
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </div>
        
        <div className={styles.question}>{currentQuestion.question}</div>
        
        <div className={styles.options}>
          {currentQuestion.answers.map((option, index) => (
            <div 
              key={index} 
              className={`${styles.option} ${selectedAnswers[currentQuestionIndex] === index ? styles.optionSelected : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              <span className={styles.optionIndicator}>
                {selectedAnswers[currentQuestionIndex] === index ? '✓ ' : ''}
              </span>
              {option}
            </div>
          ))}
        </div>
        
        <div className={styles.quizNavigation}>
          <button 
            className={`${styles.quizButton} ${styles.secondaryButton}`}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
          >
            Previous
          </button>
          
          {currentQuestionIndex < quizData.questions.length - 1 ? (
            <button 
              className={`${styles.quizButton} ${styles.primaryButton}`}
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button 
              className={`${styles.quizButton} ${styles.primaryButton}`}
              onClick={handleSubmitQuiz}
              disabled={Object.keys(selectedAnswers).length < quizData.questions.length}
              style={{ 
                opacity: Object.keys(selectedAnswers).length < quizData.questions.length ? 0.5 : 1 
              }}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Search section */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search any topic like 'Stacks', 'Recursion', or 'SQL Joins'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            <FaSearch size={20} />
          </button>
        </form>

        {/* Mode toggle buttons */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.toggleButton} ${activeMode === 'learn' ? `${styles.toggleButtonActive} ${styles.learnActive}` : ''}`}
            onClick={() => setActiveMode('learn')}
          >
            <FaBookOpen style={{ marginRight: '8px' }} />
            Learn
          </button>
          <button
            className={`${styles.toggleButton} ${activeMode === 'quiz' ? `${styles.toggleButtonActive} ${styles.quizActive}` : ''}`}
            onClick={() => setActiveMode('quiz')}
          >
            <FaQuestionCircle style={{ marginRight: '8px' }} />
            Quiz
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.contentArea}>
        {activeMode === 'learn' ? renderLearnContent() : renderQuizContent()}
      </div>
    </div>
  );
}
