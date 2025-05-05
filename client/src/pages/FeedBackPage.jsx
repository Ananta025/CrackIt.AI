import React from 'react'
import styles from '../styles/FeedBackPage.module.css'

export default function FeedBackPage() {
  // Replace this URL with your actual Google Form link
  const googleFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSepiVtUYzdF90K46o4QgGXEj7rEL3NTvYOI4iLh8oihILJTpw/viewform?usp=sharing";

  return (
    <div style={{ 
      backgroundColor: '#121212', 
      minHeight: '100vh', 
      width: '100%', 
      position: 'relative' 
    }}>
      <div className={styles.feedbackContainer}>
        <h1 className={styles.feedbackTitle}>We Value Your Feedback</h1>
        
        <div className={styles.feedbackContent}>
          <p className={styles.feedbackDescription}>
            Your opinion matters to us! Help us improve CrackIt.AI by sharing your thoughts, 
            suggestions, and experiences. Your feedback is essential for us to provide you 
            with the best learning experience.
          </p>
          
          <div className={styles.formLinkSection}>
            <h2>Ready to share your thoughts?</h2>
            <p>Click the button below to access our feedback form.</p>
            <a 
              href={googleFormLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.formButton}
            >
              Complete Feedback Form
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
