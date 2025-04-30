import React, { useState } from "react";
import styles from "./UrlInput.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { ArrowLeft, LinkedinIcon, Search } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const UrlInput = () => {
  const { setSelectedOption } = useProfileOptimizer();
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!linkedinUrl.trim()) {
      setError("Please enter your LinkedIn URL");
      return;
    }

    if (!linkedinUrl.includes("linkedin.com/")) {
      setError("Please enter a valid LinkedIn URL");
      return;
    }

    setError("");
    setIsAnalyzing(true);

    // Simulate analysis (this would be replaced with actual API call)
    setTimeout(() => {
      setIsAnalyzing(false);
      // This would normally redirect to results or next step
      // For now just show a fake success message
      alert(
        "Profile analyzed successfully! In a complete implementation, optimization suggestions would be shown here."
      );
    }, 2000);
  };

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
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>

        {error && <p className={styles["error-message"]}>{error}</p>}

        <button type="submit" className={`${pageStyles.btn} ${styles["btn-analyze"]}`} disabled={isAnalyzing}>
          {isAnalyzing ? (
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