import React, { useEffect, useState } from 'react'
import styles from './ThankYouScreen.module.css'

export default function ThankYouScreen({ goToSummary }) {
  const [countdown, setCountdown] = useState(5);

  // Auto-proceed to summary after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      goToSummary();
    }, 5000); // Increased to 5 seconds to give backend more time
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [goToSummary]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-20 h-20 rounded-full bg-green-900 bg-opacity-30 flex items-center justify-center mb-6">
        <i className="fa-solid fa-check text-green-400 text-3xl"></i>
      </div>
      
      <h1 className={styles.title}>Interview Complete!</h1>
      
      <p className="text-gray-300 text-lg mb-6 max-w-2xl">
        Thank you for completing your interview with CrackIt.AI. We appreciate your time and thoughtful responses.
      </p>
      
      <p className="text-gray-400 mb-8">
        Your interview performance is being analyzed. You will see your results in {countdown} seconds.
      </p>
      
      <button
        onClick={goToSummary}
        className={styles.primaryButton}
      >
        <i className="fa-solid fa-chart-bar mr-2"></i>
        View My Results Now
      </button>
    </div>
  )
}
