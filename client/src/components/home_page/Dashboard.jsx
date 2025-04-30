import React, { useState } from 'react'
import styles from './Dashboard.module.css'
import Sidebar from './Sidebar'

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState('Home');
  
  const handleLogout = () => {
    // Handle logout functionality here
    console.log('Logging out...');
  };

  return (
    <div className={styles.dashboard}>
        {/* Use the new modular Sidebar component */}
        <Sidebar 
          username="Username" 
          onLogout={handleLogout}
          activeFeature={activeFeature}
        />

        {/* dashboard main part */}
        <main className={styles.main}>
            <div className={styles.upper}>
                <img className={styles.avatar} src="./images/avatar-male.svg" alt="avatar" />
                <div className={styles["user-details"]}>
                    <div className={styles["top-skill"]}>
                        <p className={styles["skill-heading"]}>My Top Skills</p>
                        <div className={styles["skill-list"]}>
                            <p className={styles.skill}>Python</p>
                            <p className={styles.skill}>JAVA</p>
                            <p className={styles.skill}>C++</p>
                            <p className={styles.skill}>HTML</p>
                            <p className={styles.skill}>CSS</p>
                            <p className={styles.skill}>Javascript</p>
                        </div>
                    </div>
                    <div className={styles.activity}>
                        {/* add chart of daily time spent logs */}
                        {/* add line graph or bar chart */}
                    </div>
                </div>
            </div>
            <div className={styles.lower}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Latest Quiz Scores</h1>
                    <div id="score-container">
                        {/* Score items will be generated dynamically */}
                        <p className={styles["no-score"]}>No score is available now!</p>
                    </div>
                </div>
                <div className={styles.github}>
                    <img className={styles.updates} src="./images/github.svg" alt="" />
                </div>
                <div className={styles.news}>
                    <img className={styles.updates} src="./images/news.svg" alt="" />
                </div>
            </div>
        </main>
    </div>
  )
}
