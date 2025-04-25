import React from 'react'
import styles from './HeroSection.module.css'


export default function HeroSection() {
  return (
    <div className={styles.hero}>
        <nav>
            <div className={styles['navbar-compo']}>
                <div className={styles.logo}>
                    <a href="#">CrackIT.Ai</a>
                </div>
                <div className={styles['link-list']}>
                    <a href="#">Home</a>
                    <a href="#">About Us</a>
                    <a href="#">Services</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
        </nav>
         <div className={styles['hero-txt']}>
            <p className={styles['hero-main-txt']}>Crack Your Next <br/><span className={styles.interview}>Interview</span> with<br/>Confidence 
            </p>
            <p className={styles['hero-sub-txt']}> Powered by<span className={styles['ai-txt']}>AI</span><img src="./images/AI star.png" alt="Ai logo"/>
            </p>
         </div>

          <div className={styles['hero-img']}>
            <img src="./images/Group 36.png" alt="hero section image"/>
          </div>
          <div className={styles['get-started-btn']}>
            <a href="/signup" className={styles['get-started']}>Get Started</a>
          </div>
    </div>
  )
}
