import React from 'react'
import styles from './HeroSection.module.css'
import Navbar from './Navbar'

export default function HeroSection() {
  return (
    <div className={styles.hero}>
        <Navbar />
        <div className={styles['hero-txt']}>
            <p className={styles['hero-main-txt']}>Crack Your Next <br/><span className={styles.interview}>Interview</span> with<br/>Confidence 
            </p>
            <p className={styles['hero-sub-txt']}> Powered by<span className={styles['ai-txt']}>AI</span>
              <img 
                src="./images/AI star.png" 
                alt="AI logo" 
                loading="lazy"
                width="20"
                height="20"
              />
            </p>
        </div>

        <div className={styles['hero-img']}>
            <img 
              src="./images/Group 36.png" 
              alt="Interview preparation illustration" 
              loading="lazy"
              width="460"
              height="460"
            />
        </div>
        <div className={styles['get-started-btn']}>
            <a href="/signup" className={styles['get-started']}>Get Started</a>
        </div>
    </div>
  )
}
