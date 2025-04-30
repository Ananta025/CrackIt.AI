import React from 'react';
import styles from "./LinkSelection.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { Linkedin, FileText } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const LinkSelection = () => {
  const { setSelectedOption } = useProfileOptimizer();

  return (
    <div className={styles["link-selection"]}>
      <h2 className={styles["selection-title"]}>How would you like to optimize your profile?</h2>
      
      <div className={styles["options-container"]}>
        <button 
          className={`${styles["option-card"]} ${pageStyles.glassCard}`}
          onClick={() => setSelectedOption('form')}
        >
          <div className={styles["option-icon"]}>
            <FileText size={36} />
          </div>
          <h3>Fill Details Manually</h3>
          <p>Create your optimized LinkedIn profile by filling out a form with your details</p>
        </button>
        
        <div className={styles["option-divider"]}>
          <span>or</span>
        </div>
        
        <button 
          className={`${styles["option-card"]} ${pageStyles.glassCard}`}
          onClick={() => setSelectedOption('url')}
        >
          <div className={`${styles["option-icon"]} ${styles.accent}`}>
            <Linkedin size={36} />
          </div>
          <h3>Analyze Existing Profile</h3>
          <p>Optimize your current LinkedIn profile by providing your public URL</p>
        </button>
      </div>
    </div>
  );
};

export default LinkSelection;