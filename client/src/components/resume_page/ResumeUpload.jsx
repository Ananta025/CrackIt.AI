import React, { useState } from 'react';
import styles from './ResumeUpload.module.css';
import resumeService from '../../services/resumeService'; // Adjust the import path as necessary

export default function ResumeUpload({ onUploadComplete }) {
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'paste'
  const [file, setFile] = useState(null);
  const [pastedContent, setPastedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file upload
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && !pastedContent) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (uploadMethod === 'file') {
        // Send file to backend for analysis
        const response = await resumeService.analyzeResume(file);
        onUploadComplete(response.data);
      } else {
        // Text analysis not implemented yet
        setError('Text analysis is not yet supported. Please upload a file instead.');
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError(err.message || 'An error occurred while analyzing your resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadCard}>
        <h2 className={styles.sectionTitle}>Upload Your Resume</h2>
        <p className={styles.sectionDescription}>
          Get AI-powered feedback to improve your resume and stand out to employers
        </p>
        
        {error && (
          <div className={`${styles.errorMessage} bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4`}>
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}
        
        <div className={styles.uploadMethodToggle}>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'file' ? styles.activeMethod : ''}`} 
            onClick={() => setUploadMethod('file')}
          >
            <i className="fa-solid fa-file-arrow-up"></i> Upload File
          </button>
          <button 
            className={`${styles.methodButton} ${uploadMethod === 'paste' ? styles.activeMethod : ''}`} 
            onClick={() => setUploadMethod('paste')}
          >
            <i className="fa-solid fa-paste"></i> Paste Text
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {uploadMethod === 'file' ? (
            <div className={styles.fileUploadArea}>
              <div 
                className={styles.dropzone} 
                onClick={() => document.getElementById('resume-file').click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                {file ? (
                  <div className={styles.fileSelected}>
                    <i className="fa-solid fa-file-pdf"></i>
                    <span className={styles.fileName}>{file.name}</span>
                  </div>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <p>Drag & drop your resume here or click to browse</p>
                    <span className={styles.supportedFormats}>Supported formats: PDF, DOCX</span>
                  </>
                )}
              </div>
              <input 
                id="resume-file" 
                type="file" 
                accept=".pdf,.docx" 
                className={styles.hiddenFileInput} 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className={styles.textInputArea}>
              <textarea 
                placeholder="Paste your resume content here..." 
                className={styles.resumeTextInput}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                rows={10}
              ></textarea>
            </div>
          )}
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={(!file && !pastedContent) || isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Analyzing Your Resume...
              </>
            ) : (
              <>
                <i className="fa-solid fa-magnifying-glass"></i>
                Analyze My Resume
              </>
            )}
          </button>
        </form>
        
        <div className={styles.featuresList}>
          <h3>What you'll get:</h3>
          <ul>
            <li><i className="fa-solid fa-check"></i> Section-by-section improvement suggestions</li>
            <li><i className="fa-solid fa-check"></i> Grammar and format corrections</li>
            <li><i className="fa-solid fa-check"></i> Tips to showcase achievements effectively</li>
            <li><i className="fa-solid fa-check"></i> ATS optimization recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
