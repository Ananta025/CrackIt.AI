import React, { useEffect } from 'react'
import styles from './HeroSection.module.css'
import Navbar from './Navbar'

export default function HeroSection() {
  // Add effect to ensure mobile viewport is properly set
  useEffect(() => {
    // Fix for mobile viewport issues
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (!metaViewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    } else {
      metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // Return cleanup function to restore viewport if needed
    return () => {};
  }, []);

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.hero}>
        <Navbar />
        <div className={styles.hero_txt}>
            <p className={styles.hero_main_txt}>Crack Your Next <br/><span className={styles.interview}>Interview</span> with<br/>Confidence 
            </p>
            <p className={styles.hero_sub_txt}> Powered by<span className={styles.ai_txt}>AI</span>
              <img 
                src="/images/AI star.png" 
                alt="AI logo" 
                loading="lazy"
                width="20"
                height="20"
              />
            </p>
        </div>

        <div className={styles.hero_img}>
            <img 
              src="/images/Group 36.png" 
              alt="Interview preparation illustration" 
              loading="lazy"
              width="460"
              height="460"
            />
        </div>
        <div className={styles.get_started_btn}>
            <a href="/signin" className={styles.get_started}>Get Started</a>
        </div>
      </div>
    </div>
  )
}
