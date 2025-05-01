import React from 'react';
import styles from './ResumePreview.module.css';
import ResumeTemplate from './ResumeTemplate';

export default function ResumePreview({ data, template }) {
  const hasData = data && (
    data.personal?.name || 
    data.summary || 
    (data.experience && data.experience.length > 0) || 
    (data.education && data.education.length > 0) ||
    (data.skills && data.skills.length > 0)
  );
  
  if (!hasData) {
    return (
      <div className={styles.emptyState}>
        <i className="fa-regular fa-file-lines"></i>
        <h3 className={styles.emptyTitle}>Your resume preview will appear here</h3>
        <p className={styles.emptyDescription}>Fill out the form on the left to see your resume take shape in real-time</p>
      </div>
    );
  }
  
  return (
    <div className={styles.previewContainer}>
      <ResumeTemplate data={data} templateName={template} />
    </div>
  );
}
