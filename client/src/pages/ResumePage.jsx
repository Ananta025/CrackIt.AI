import React, { useState } from 'react';
import styles from '../styles/ResumePage.module.css';

// Import resume components
import ResumeUpload from '../components/resume_page/ResumeUpload';
import ResumeReview from '../components/resume_page/ResumeReview';
import ResumeBuilder from '../components/resume_page/ResumeBuilder';


export default function ResumePage() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'build'
  const [uploadedResume, setUploadedResume] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Handle resume upload completion
  const handleResumeUpload = (analysisData) => {
    setUploadedResume(analysisData);
    
    // Transform backend analysis data into format needed by ResumeReview
    const sections = {};
    
    // Handle different sections
    if (analysisData.summary) {
      sections.summary = {
        original: analysisData.summary.extracted || '',
        improved: analysisData.summary.improved || analysisData.summary.extracted || '',
      };
    }
    
    if (analysisData.experience) {
      sections.experience = {
        original: Array.isArray(analysisData.experience.extracted) 
          ? analysisData.experience.extracted.join('\n\n') 
          : analysisData.experience.extracted || '',
        improved: Array.isArray(analysisData.experience.improved) 
          ? analysisData.experience.improved.join('\n\n') 
          : analysisData.experience.improved || '',
      };
    }
    
    if (analysisData.skills) {
      sections.skills = {
        original: Array.isArray(analysisData.skills.extracted) 
          ? analysisData.skills.extracted.join(', ') 
          : analysisData.skills.extracted || '',
        improved: Array.isArray(analysisData.skills.missing) 
          ? [...(analysisData.skills.extracted || []), ...(analysisData.skills.missing || [])].join(', ')
          : analysisData.skills.extracted || '',
      };
    }
    
    // Create review data for display
    setReviewData({
      score: analysisData.atsCompatibility?.score || 0,
      sections,
      suggestions: analysisData.overallSuggestions || []
    });
  };

  return (
    <div className={styles.resumePage}>
      <div className={styles.header}>
        <h1>Resume Assistant</h1>
        <p>Create or improve your resume with AI-powered tools</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
          <button onClick={() => setError(null)} className="float-right text-red-700">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}
      
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'upload' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <i className="fa-solid fa-file-arrow-up"></i>
          <span>Upload & Review</span>
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'build' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('build')}
        >
          <i className="fa-solid fa-pen-to-square"></i>
          <span>Create from Scratch</span>
        </button>
      </div>
      
      <div className={styles.content}>
        {activeTab === 'upload' ? (
          <>
            {!reviewData ? (
              <ResumeUpload onUploadComplete={handleResumeUpload} />
            ) : (
              <ResumeReview reviewData={reviewData} originalResume={uploadedResume} />
            )}
          </>
        ) : (
          <ResumeBuilder />
        )}
      </div>
    </div>
  );
}

