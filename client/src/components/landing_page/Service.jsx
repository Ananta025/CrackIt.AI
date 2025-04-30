import React from 'react'
import styles from './Service.module.css'

export default function Service() {
  return (
    <div className={styles["service-container"]}>
        <div className={styles.heading}>
            <p className={styles["main-heading"]}>Powerful Features</p>
            <p className={styles["main-heading"]}>just for you</p>
            <p className={styles["sub-heading"]}>Our website offers a range of powerful features designed to<br/>elevate your Interview preparation journey</p>
        </div>

        {/* service card section */}
        <div className={styles.service}>
            <div className={`${styles.upper} ${styles.row}`}>
                <div className={styles.card} id={styles["card-1"]}>
                    <img className={styles.icon} src="./images/interview.png" alt="mock-interview"/>
                    <p className={styles.title}>AI Powered Mock Interview</p>
                    <p className={styles.details}>Practice with our AI interviewer to improve your skills and confidence for real interviews.</p>
                </div>
                <div className={styles.card} id={styles["card-2"]}>
                    <img className={styles.icon} src="./images//resume.png" alt="resume"/>
                    <p className={styles.title}>Resume Build & Analyze</p>
                    <p className={styles.details}>Create and optimize your resume with professional templates and AI-powered feedback.</p>
                </div>
            </div>
            <div className={`${styles.lower} ${styles.row}`}>
                <div className={styles.card} id={styles["card-3"]}>
                    <img className={styles.icon} src="./images/linkedin.png" alt="linkedin"/>
                    <p className={styles.title}>LinkedIn Optimizer</p>
                    <p className={styles.details}>Enhance your LinkedIn profile to attract recruiters and stand out.</p>
                </div>
                <div className={styles.card} id={styles["card-4"]}>
                    <img className={styles.icon} src="./images/quiz.png" alt="quiz"/>
                    <p className={styles.title}>Interview Quiz</p>
                    <p className={styles.details}>Test your knowledge with industry-specific interview questions.</p>
                </div>
                <div className={styles.card} id={styles["card-5"]}>
                    <img className={styles.icon} src="./images/pdf.png" alt="resources"/>
                    <p className={styles.title}>Preparation Resource</p>
                    <p className={styles.details}>Access curated materials to boost your interview preparation.</p>
                </div>
            </div>
        </div>
    </div>
  )
}
