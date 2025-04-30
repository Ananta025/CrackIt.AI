import React, { useState } from "react";
import styles from "./ProfileForm.module.css";
import pageStyles from "../../../styles/LinkedinPage.module.css";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useProfileOptimizer } from "../../../context/ProfileOptimizer";

const ProfileForm = () => {
  const { setSelectedOption } = useProfileOptimizer();
  const [formData, setFormData] = useState({
    heading: "",
    summary: "",
    experience: "",
    skills: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsComplete(true);
    }, 2000);
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Professional Headline</h3>
            <p className={styles["step-description"]}>
              Enter your current LinkedIn headline or the position you'd like to
              optimize for
            </p>
            <input
              type="text"
              name="heading"
              className={pageStyles.inputField}
              placeholder="e.g., Senior Software Engineer at Tech Company"
              value={formData.heading}
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
              name="summary"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="Brief description of your professional background, achievements, and goals..."
              value={formData.summary}
              onChange={handleChange}
              required
            />
          </div>
        );
      case 3:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Experience Details</h3>
            <p className={styles["step-description"]}>
              Describe your most relevant work experience that you'd like to
              highlight
            </p>
            <textarea
              name="experience"
              className={`${pageStyles.inputField} ${pageStyles.textareaField}`}
              placeholder="Your recent role responsibilities, achievements, and impact..."
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>
        );
      case 4:
        return (
          <div className={styles["form-step"]}>
            <h3 className={styles["step-title"]}>Skills & Expertise</h3>
            <p className={styles["step-description"]}>
              List your key skills, separated by commas
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

  if (isComplete) {
    return (
      <div className={styles["success-container"]}>
        <div className={styles["success-icon"]}>
          <CheckCircle2 size={48} />
        </div>
        <h2 className={styles["success-title"]}>Profile Analysis Complete!</h2>
        <p className={styles["success-message"]}>
          We've analyzed your information and prepared optimization suggestions
          for your LinkedIn profile. In a complete implementation, you would see
          personalized recommendations here.
        </p>
        <button className={pageStyles.btn} onClick={() => setSelectedOption("")}>
          Start Over
        </button>
      </div>
    );
  }

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
                ? "Headline"
                : step === 2
                ? "Summary"
                : step === 3
                ? "Experience"
                : "Skills"}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {renderFormStep()}

        <div className={styles["form-navigation"]}>
          {currentStep > 1 && (
            <button
              type="button"
              className={`${pageStyles.btn} ${styles["btn-secondary"]}`}
              onClick={prevStep}
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" className={pageStyles.btn} onClick={nextStep}>
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={`${pageStyles.btn} ${styles["btn-submit"]}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles["loading-spinner"]}></span>
                  Submitting...
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