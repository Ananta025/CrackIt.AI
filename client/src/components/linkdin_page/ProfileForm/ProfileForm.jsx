import React, { useState } from "react";
import styles from "./ProfileForm.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const ProfileForm = () => {
  const { 
    setSelectedOption, 
    optimizeManualProfile,
    isLoading, 
    error 
  } = useProfileOptimizer();
  
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    about: "",
    experience: "",
    education: "",
    skills: ""
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError("");
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1 && !formData.headline.trim()) {
      setLocalError("Please enter your headline");
      return;
    }
    
    if (currentStep === 2 && !formData.about.trim()) {
      setLocalError("Please enter your professional summary");
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setLocalError("");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setLocalError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step
    if (!formData.skills.trim()) {
      setLocalError("Please enter your skills");
      return;
    }
    
    // Format data for API
    const profileData = {
      name: formData.name,
      headline: formData.headline,
      about: formData.about,
      // Convert comma-separated/line-break text to arrays
      experience: formData.experience
        .split(/\n|,/)
        .filter(item => item.trim())
        .map(item => ({ description: item.trim() })),
      education: formData.education
        .split(/\n|,/)
        .filter(item => item.trim())
        .map(item => ({ description: item.trim() })),
      skills: formData.skills
        .split(/\n|,/)
        .filter(item => item.trim())
        .map(item => item.trim())
    };
    
    try {
      // Call API through context
      await optimizeManualProfile(profileData);
      // Success handled through context state
    } catch (err) {
      setLocalError(err.message || "Failed to analyze profile. Please try again.");
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Basic Information</h3>
            <p className={styles["step-description"]}>
              Enter your name and current LinkedIn headline
            </p>
            <input
              type="text"
              name="name"
              className={pageStyles.inputField}
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="headline"
              className={pageStyles.inputField}
              placeholder="e.g., Senior Software Engineer at Tech Company"
              value={formData.headline}
              onChange={handleChange}
              required
            />
          </div>
        );
      case 2:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Professional Summary</h3>
            <p className={styles["step-description"]}>
              Enter your current LinkedIn summary or key points about yourself
            </p>
            <textarea
              name="about"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="Brief description of your professional background, achievements, and goals..."
              value={formData.about}
              onChange={handleChange}
              required
            />
          </div>
        );
      case 3:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Experience & Education</h3>
            <p className={styles["step-description"]}>
              Describe your most relevant work experience and education details
            </p>
            <textarea
              name="experience"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="Your recent roles and responsibilities (separate entries with commas or line breaks)"
              value={formData.experience}
              onChange={handleChange}
            />
            <textarea
              name="education"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="Your education details (separate entries with commas or line breaks)"
              value={formData.education}
              onChange={handleChange}
            />
          </div>
        );
      case 4:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Skills & Expertise</h3>
            <p className={styles["step-description"]}>
              List your key skills, separated by commas or line breaks
            </p>
            <textarea
              name="skills"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="e.g., Project Management, JavaScript, Data Analysis, Leadership..."
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Display errors from context or local validation
  const displayError = error || localError;

  return (
    <div className={styles["profile-form"]}>
      {currentStep === 1 && (
        <button className={styles["back-button"]} onClick={() => setSelectedOption("")}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      )}

      <h2 className={styles["form-title"]}>Create Your Optimized LinkedIn Profile</h2>

      <div className={styles["form-progress"]}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`${styles["progress-step"]} ${
              step === currentStep ? styles.active : ""
            } ${step < currentStep ? styles.completed : ""}`}
            onClick={() => step < currentStep && setCurrentStep(step)}
          >
            <div className={styles["step-indicator"]}>{step}</div>
            <div className={styles["step-label"]}>
              {step === 1
                ? "Basic Info"
                : step === 2
                ? "Summary"
                : step === 3
                ? "Experience"
                : "Skills"}
            </div>
          </div>
        ))}
      </div>

      {displayError && (
        <div className={styles["error-container"]}>
          <p className={styles["error-message"]}>{displayError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {renderFormStep()}

        <div className={styles["form-navigation"]}>
          {currentStep > 1 && (
            <button
              type="button"
              className={`${pageStyles.btn} ${styles["btn-secondary"]}`}
              onClick={prevStep}
              disabled={isLoading}
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button 
              type="button" 
              className={pageStyles.btn} 
              onClick={nextStep}
              disabled={isLoading}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={`${pageStyles.btn} ${styles["btn-submit"]}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles["loading-spinner"]}></span>
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit for Analysis
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;