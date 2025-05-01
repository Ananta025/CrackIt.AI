import React, { useState } from "react";
import styles from "./OptimizationResults.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { ArrowLeft, RefreshCw, CheckCircle, Download, Zap } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const OptimizationResults = () => {
  const { 
    resetState, 
    originalProfile, 
    optimizedProfile, 
    comparison, 
    regenerateSection, 
    isLoading,
    saveOptimization 
  } = useProfileOptimizer();
  
  const [activeSection, setActiveSection] = useState("headline");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  if (!originalProfile || !optimizedProfile || !comparison) {
    return (
      <div className={styles["results-error"]}>
        <h2>No optimization data available</h2>
        <button className={pageStyles.btn} onClick={resetState}>
          Start Over
        </button>
      </div>
    );
  }

  const handleRegenerateSection = async () => {
    try {
      await regenerateSection(activeSection);
    } catch (error) {
      console.error(`Failed to regenerate ${activeSection}:`, error);
    }
  };

  const handleSaveOptimization = async () => {
    try {
      setIsSaving(true);
      await saveOptimization();
      setSaveMessage("Optimization saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to save optimization");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles["results-container"]}>
      <div className={styles["results-header"]}>
        <button className={styles["back-button"]} onClick={resetState}>
          <ArrowLeft size={18} />
          <span>Start Over</span>
        </button>
        <h2 className={styles["results-title"]}>Your Optimized LinkedIn Profile</h2>
        <div className={styles["improvement-score"]}>
          <Zap size={24} />
          <span>Overall Improvement: {comparison.overallImprovement}%</span>
        </div>
      </div>

      <div className={styles["section-tabs"]}>
        <button
          className={`${styles["tab"]} ${activeSection === "headline" ? styles["active"] : ""}`}
          onClick={() => setActiveSection("headline")}
        >
          Headline
          <span className={styles["improvement-badge"]}>+{comparison.headline?.improvement || 0}%</span>
        </button>
        <button
          className={`${styles["tab"]} ${activeSection === "about" ? styles["active"] : ""}`}
          onClick={() => setActiveSection("about")}
        >
          About
          <span className={styles["improvement-badge"]}>+{comparison.about?.improvement || 0}%</span>
        </button>
        <button
          className={`${styles["tab"]} ${activeSection === "experience" ? styles["active"] : ""}`}
          onClick={() => setActiveSection("experience")}
        >
          Experience
          <span className={styles["improvement-badge"]}>+{comparison.experience?.improvement || 0}%</span>
        </button>
        <button
          className={`${styles["tab"]} ${activeSection === "education" ? styles["active"] : ""}`}
          onClick={() => setActiveSection("education")}
        >
          Education
          <span className={styles["improvement-badge"]}>+{comparison.education?.improvement || 0}%</span>
        </button>
        <button
          className={`${styles["tab"]} ${activeSection === "skills" ? styles["active"] : ""}`}
          onClick={() => setActiveSection("skills")}
        >
          Skills
          <span className={styles["improvement-badge"]}>+{comparison.skills?.improvement || 0}%</span>
        </button>
      </div>

      <div className={styles["comparison-container"]}>
        <div className={styles["original-content"]}>
          <h3 className={styles["column-title"]}>Original</h3>
          <div className={`${styles["content-box"]} ${pageStyles.glassCard}`}>
            {activeSection === "headline" && (
              <p>{originalProfile.headline || 'No headline provided'}</p>
            )}
            
            {activeSection === "about" && (
              <p>{originalProfile.about || 'No about section provided'}</p>
            )}
            
            {activeSection === "experience" && (
              <ul>
                {(originalProfile.experience && originalProfile.experience.length > 0) ? 
                  originalProfile.experience.map((exp, idx) => (
                    <li key={idx}>
                      {exp.title || exp.description || exp}
                    </li>
                  )) : 
                  <li>No experience entries provided</li>
                }
              </ul>
            )}
            
            {activeSection === "education" && (
              <ul>
                {(originalProfile.education && originalProfile.education.length > 0) ? 
                  originalProfile.education.map((edu, idx) => (
                    <li key={idx}>
                      {edu.school || edu.description || edu}
                    </li>
                  )) : 
                  <li>No education entries provided</li>
                }
              </ul>
            )}
            
            {activeSection === "skills" && (
              <ul className={styles["skills-list"]}>
                {(originalProfile.skills && originalProfile.skills.length > 0) ? 
                  originalProfile.skills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  )) : 
                  <li>No skills provided</li>
                }
              </ul>
            )}
          </div>
        </div>

        <div className={styles["optimized-content"]}>
          <h3 className={styles["column-title"]}>
            Optimized
            <button 
              className={styles["regenerate-btn"]} 
              onClick={handleRegenerateSection}
              disabled={isLoading}
            >
              <RefreshCw size={16} />
              {isLoading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </h3>
          <div className={`${styles["content-box"]} ${pageStyles.glassCard}`}>
            {activeSection === "headline" && (
              <p>{optimizedProfile.headline || 'No optimized headline available'}</p>
            )}
            
            {activeSection === "about" && (
              <p>{optimizedProfile.about || 'No optimized about section available'}</p>
            )}
            
            {activeSection === "experience" && (
              <ul>
                {(optimizedProfile.experience && optimizedProfile.experience.length > 0) ? 
                  optimizedProfile.experience.map((exp, idx) => (
                    <li key={idx}>
                      {exp.title || exp.description || exp}
                    </li>
                  )) : 
                  <li>No optimized experience entries available</li>
                }
              </ul>
            )}
            
            {activeSection === "education" && (
              <ul>
                {(optimizedProfile.education && optimizedProfile.education.length > 0) ? 
                  optimizedProfile.education.map((edu, idx) => (
                    <li key={idx}>
                      {edu.school || edu.description || edu}
                    </li>
                  )) : 
                  <li>No optimized education entries available</li>
                }
              </ul>
            )}
            
            {activeSection === "skills" && (
              <ul className={styles["skills-list"]}>
                {(optimizedProfile.skills && optimizedProfile.skills.length > 0) ? 
                  optimizedProfile.skills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  )) : 
                  <li>No optimized skills available</li>
                }
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Improvement explanation */}
      <div className={`${styles["explanation-section"]} ${pageStyles.glassCard}`}>
        <h3>Why this improves your profile</h3>
        <p>
          {activeSection === "headline" && 
            (optimizedProfile.explanations?.headline || 'No explanation available')}
          {activeSection === "about" && 
            (optimizedProfile.explanations?.about || 'No explanation available')}
          {activeSection === "experience" && 
            (optimizedProfile.explanations?.experience || 'No explanation available')}
          {activeSection === "education" && 
            (optimizedProfile.explanations?.education || 'No explanation available')}
          {activeSection === "skills" && 
            (optimizedProfile.explanations?.skills || 'No explanation available')}
        </p>
      </div>

      <div className={styles["action-buttons"]}>
        <button 
          className={`${pageStyles.btn} ${styles["save-btn"]}`}
          onClick={handleSaveOptimization}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className={styles["loading-spinner"]}></span>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Save Optimization
            </>
          )}
        </button>
        
        <button className={`${pageStyles.btn} ${styles["download-btn"]}`}>
          <Download size={18} />
          Download as PDF
        </button>
      </div>

      {saveMessage && (
        <div className={styles["save-message"]}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default OptimizationResults;
