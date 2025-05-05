import React, { useState, useEffect } from 'react';
import styles from './ResumeBuilder.module.css';
import ResumeFormStep from './ResumeFormStep';
import ResumePreview from './ResumePreview';
import resumeFormSteps from '../../data/resumeFormSteps';
import resumeService from '../../services/resumeService';
import { useNavigate } from 'react-router-dom';
import TemplateSelector from './TemplateSelector';

export default function ResumeBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      location: '',
    },
    summary: '',
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    }],
    education: [{
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    }],
    skills: [],
    projects: [{
      name: '',
      description: '',
      technologies: '',
      url: '',
    }],
    certifications: [{
      name: '',
      issuer: '',
      date: '',
    }],
  });
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetch templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await resumeService.getTemplates();
        if (response.success && response.data) {
          setTemplates(response.data);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Silent fail - will use default templates from utils/resumeTemplates.js
      }
    };
    
    fetchTemplates();
  }, []);

  // Handle updating form data
  const handleFormDataUpdate = (section, newData) => {
    setResumeData(prev => ({
      ...prev,
      [section]: newData
    }));
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (activeStep < resumeFormSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setShowTemplateSelector(true);
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Save resume to backend
  const handleSaveResume = async () => {
    if (!localStorage.getItem('token')) {
      // Prompt to sign in if not authenticated
      if (confirm('You need to be signed in to save your resume. Would you like to sign in now?')) {
        navigate('/signin', { state: { redirectTo: '/resume' } });
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get template ID or name - convert to string to avoid ObjectId issues
      const templateId = templates.find(t => 
        t.name.toLowerCase() === activeTemplate.toLowerCase() || 
        t._id === activeTemplate
      )?._id || activeTemplate;
      
      // Ensure all data is properly formatted
      const formattedResumeData = {
        name: resumeData.personal?.name ? `${resumeData.personal.name}'s Resume` : 'My Resume',
        templateId: templateId,
        content: {
          ...resumeData,
          // Ensure summary is a string
          summary: typeof resumeData.summary === 'string' 
            ? resumeData.summary 
            : JSON.stringify(resumeData.summary)
        },
      };
      
      const response = await resumeService.saveResume(formattedResumeData);
      
      if (response.success) {
        setSuccess('Resume saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to save resume');
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      setError(err.message || 'Failed to save your resume');
    } finally {
      setIsLoading(false);
    }
  };

  // Download resume as PDF
  const handleDownloadResume = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get template ID or name - convert to string to avoid ObjectId issues
      const templateId = templates.find(t => 
        t.name.toLowerCase() === activeTemplate.toLowerCase() || 
        t._id === activeTemplate
      )?._id || activeTemplate;
      
      // First save the resume to get an ID (required for PDF generation)
      const saveResponse = await resumeService.saveResume({
        name: resumeData.personal?.name ? `${resumeData.personal.name}'s Resume` : 'My Resume',
        templateId: templateId,
        content: resumeData,
      });
      
      if (!saveResponse.success || !saveResponse.data.resumeId) {
        throw new Error('Failed to prepare resume for download');
      }
      
      const resumeId = saveResponse.data.resumeId;
      console.log(`Downloading PDF for resume ID: ${resumeId}`);
      
      // Then download the PDF using the ID
      const pdfBlob = await resumeService.downloadResume(resumeId);
      console.log(`PDF blob received, size: ${pdfBlob.size} bytes`);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use the person's name for the filename, with fallback
      const fileName = `${resumeData.personal?.name || 'Resume'}.pdf`;
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setSuccess('Resume downloaded successfully!');
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError(err.message || 'Failed to download resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.builderContainer}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-700"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <i className="fa-solid fa-check-circle mr-2"></i>
          {success}
        </div>
      )}
      
      {showTemplateSelector ? (
        <div className={styles.templateSelectorWrapper}>
          <h2 className={styles.stepTitle}>Choose a Template</h2>
          <div className={styles.templateGrid}>
            <TemplateSelector
              activeTemplate={activeTemplate}
              setActiveTemplate={setActiveTemplate}
            />
          </div>
          <div className={styles.templateActions}>
            <button 
              className={styles.backButton} 
              onClick={() => setShowTemplateSelector(false)}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Editor
            </button>
            <button 
              className={styles.saveButton} 
              onClick={handleSaveResume}
              disabled={isLoading}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fa-solid fa-save"></i> Save Resume</>
              )}
            </button>
            <button 
              className={styles.downloadButton} 
              onClick={handleDownloadResume}
              disabled={isLoading}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</>
              ) : (
                <><i className="fa-solid fa-download"></i> Download PDF</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.formPreviewLayout}>
          <div className={styles.formSection}>
            <div className={styles.stepProgress}>
              <span>{activeStep + 1} of {resumeFormSteps.length}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${((activeStep + 1) / resumeFormSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <ResumeFormStep
              step={resumeFormSteps[activeStep]}
              data={resumeData[resumeFormSteps[activeStep].id]}
              onUpdate={(newData) => handleFormDataUpdate(resumeFormSteps[activeStep].id, newData)}
            />
            
            <div className={styles.navigationButtons}>
              <button 
                className={styles.prevButton}
                onClick={handlePrevStep}
                disabled={activeStep === 0}
              >
                <i className="fa-solid fa-arrow-left"></i> Previous
              </button>
              <button 
                className={styles.nextButton}
                onClick={handleNextStep}
              >
                {activeStep === resumeFormSteps.length - 1 ? (
                  <>Finish <i className="fa-solid fa-check"></i></>
                ) : (
                  <>Next <i className="fa-solid fa-arrow-right"></i></>
                )}
              </button>
            </div>
          </div>
          
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h3>Live Preview</h3>
              <button 
                className={styles.templateButton} 
                onClick={() => setShowTemplateSelector(true)}
              >
                <i className="fa-solid fa-palette"></i> Change Template
              </button>
            </div>
            <ResumePreview
              data={resumeData}
              template={activeTemplate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
