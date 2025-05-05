import React, { useEffect, useState } from 'react'
import styles from './ThankYouScreen.module.css'

export default function ThankYouScreen({ goToSummary }) {
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);

  // Auto-proceed to summary after 5 seconds
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const timer = setTimeout(() => {
      try {
        goToSummary().catch(err => {
          console.error("Error going to summary:", err);
          setError("There was an error loading your results. Please try again.");
        });
      } catch (err) {
        console.error("Error going to summary:", err);
        setError("There was an error loading your results. Please try again.");
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [goToSummary]);
  
  const handleRetry = () => {
    setError(null);
    setCountdown(3);
    
    setTimeout(() => {
      try {
        goToSummary().catch(err => {
          setError("Still having trouble accessing your results. Please try again later.");
        });
      } catch (err) {
        setError("Still having trouble accessing your results. Please try again later.");
      }
    }, 500);
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <div className="w-16 h-16 rounded-full bg-green-900 bg-opacity-30 flex items-center justify-center mb-4">
        <span className="text-2xl text-green-400">✓</span>
      </div>
      
      <h1 className={styles.title}>Interview Complete!</h1>
      
      <div className={styles.interviewMessage}>
        <div className={styles.interviewText}>
          Thanks for taking the mock interview! We're analyzing your responses now.
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-900 bg-opacity-20 rounded-lg border border-red-800 p-3 max-w-md mt-6">
          <p className="text-red-300 text-sm">
            {error}
          </p>
        </div>
      ) : (
        <p className="text-gray-400 my-6 text-sm">
          Results ready in {countdown} seconds.
        </p>
      )}
      
      <button
        onClick={error ? handleRetry : goToSummary}
        className={styles.primaryButton}
      >
        {error ? "Retry Loading Results" : "View My Results Now"}
      </button>
    </div>
  )
}
