import React, { useState } from "react";
import styles from "./UrlInput.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { ArrowLeft, LinkedinIcon, Search } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const UrlInput = () => {
  const { setSelectedOption, optimizeByUrl, isLoading, error, setError } = useProfileOptimizer();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!linkedinUrl.trim()) {
      setLocalError("Please enter your LinkedIn URL");
      return;
    }

    if (!linkedinUrl.includes("linkedin.com/")) {
      setLocalError("Please enter a valid LinkedIn URL");
      return;
    }

    setLocalError("");
    
    try {
      // Call the API through our context function
      await optimizeByUrl(linkedinUrl);
      // Success will automatically show results via context state
    } catch (error) {
      // Handle specific errors from the API
      if (error.requiresManualEntry) {
        // If scraping failed but we can still proceed with manual entry
        alert("We couldn't automatically analyze your profile. Let's enter the information manually.");
        setSelectedOption("form");
      } else {
        setLocalError(error.message || "Failed to analyze profile. Please try again.");
      }
    }
  };

  // Display either context error or local validation error
  const displayError = error || localError;

  return (
    <div className={styles["url-input"]}>
      <button className={styles["back-button"]} onClick={() => setSelectedOption("")}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <h2 className={styles["url-title"]}>Analyze Your LinkedIn Profile</h2>
      <p className={styles["url-subtitle"]}>
        Enter your LinkedIn public profile URL to get personalized optimization
        suggestions
      </p>

      <form className={styles["url-form"]} onSubmit={handleSubmit}>
        <div className={styles["url-input-container"]}>
          <LinkedinIcon size={20} className={styles["url-icon"]} />
          <input
            type="text"
            className={`${styles["input-field"]} ${pageStyles.inputField}`}
            placeholder="https://www.linkedin.com/in/your-profile"
            value={linkedinUrl}
            onChange={(e) => {
              setLinkedinUrl(e.target.value);
              setLocalError("");
              setError(null);
            }}
          />
        </div>

        {displayError && <p className={styles["error-message"]}>{displayError}</p>}

        <button type="submit" className={`${pageStyles.btn} ${styles["btn-analyze"]}`} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className={styles["loading-spinner"]}></span>
              Analyzing Profile...
            </>
          ) : (
            <>
              <Search size={18} />
              Analyze Profile
            </>
          )}
        </button>
      </form>

      <div className={styles["url-info"]}>
        <h3>What happens next?</h3>
        <ul className={styles["info-steps"]}>
          <li>
            <div className={styles["step-number"]}>1</div>
            <div className={styles["step-text"]}>We analyze your LinkedIn profile content</div>
          </li>
          <li>
            <div className={styles["step-number"]}>2</div>
            <div className={styles["step-text"]}>Our AI identifies optimization opportunities</div>
          </li>
          <li>
            <div className={styles["step-number"]}>3</div>
            <div className={styles["step-text"]}>You get personalized suggestions to enhance your profile</div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UrlInput;