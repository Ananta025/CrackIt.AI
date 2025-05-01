import React, { useState } from 'react';
import styles from './ResumeReview.module.css';

export default function ResumeReview({ reviewData, originalResume }) {
  const [activeSection, setActiveSection] = useState('summary');
  const [regenerating, setRegenerating] = useState({});

  // Handle copying improved text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    
    // Show a temporary "Copied!" message
    // This would be implemented with a toast/notification in a real app
    alert('Copied to clipboard!');
  };

  // Handle regenerating a section
  const handleRegenerate = (section) => {
    setRegenerating((prev) => ({ ...prev, [section]: true }));
    
    // In a real implementation, you would call your API to regenerate this section
    // Simulating API call delay
    setTimeout(() => {
      setRegenerating((prev) => ({ ...prev, [section]: false }));
      
      // We would update the reviewData with the new content here
      // For this example, we'll just leave it as is
    }, 2000);
  };

  return (
    <div className={styles.reviewContainer}>
      <div className={styles.header}>
        <h2>Resume Review Results</h2>
        <div className={styles.scoreCard}>
          <div className={styles.score}>{reviewData.score}/100</div>
          <div className={styles.scoreLabel}>
            ATS Score
            <i className="fa-regular fa-circle-question" title="ATS (Applicant Tracking System) score indicates how well your resume will perform in automated screening systems."></i>
          </div>
        </div>
      </div>

      <div className={styles.suggestionsBox}>
        <h3>
          <i className="fa-solid fa-lightbulb"></i>
          Key Improvement Suggestions
        </h3>
        <ul>
          {reviewData.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <div className={styles.sectionsNav}>
        {Object.keys(reviewData.sections).map((section) => (
          <button
            key={section}
            className={`${styles.sectionTab} ${activeSection === section ? styles.activeSection : ''}`}
            onClick={() => setActiveSection(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.comparisonContainer}>
        <div className={styles.comparisonCard}>
          <div className={styles.original}>
            <h3>Original</h3>
            <div className={styles.content}>
              {reviewData.sections[activeSection].original}
            </div>
          </div>
          
          <div className={styles.improved}>
            <h3>AI Improved</h3>
            <div className={styles.content}>
              {reviewData.sections[activeSection].improved}
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.actionButton}
                onClick={() => copyToClipboard(reviewData.sections[activeSection].improved)}
              >
                <i className="fa-regular fa-copy"></i> Copy Text
              </button>
              <button 
                className={`${styles.actionButton} ${regenerating[activeSection] ? styles.regenerating : ''}`}
                onClick={() => handleRegenerate(activeSection)}
                disabled={regenerating[activeSection]}
              >
                {regenerating[activeSection] ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Regenerating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i> Regenerate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.downloadButton}>
          <i className="fa-solid fa-download"></i> Download All Suggestions
        </button>
        <button className={styles.startOverButton} onClick={() => window.location.reload()}>
          <i className="fa-solid fa-rotate"></i> Start Over
        </button>
      </div>
    </div>
  );
}
