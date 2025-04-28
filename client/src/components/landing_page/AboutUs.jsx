import React from 'react';
import styles from './AboutUs.module.css';
import { motion } from 'framer-motion';

export default function AboutUs() {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,  // Increased delay between children
        delayChildren: 0.2     // Added delay before starting children animations
      }
    }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,  // Reduced stiffness for slower animation
        damping: 15     // Increased damping for slower animation
      }
    }
  };

  return (
    <section id="about" className={styles['about-us']}>
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.8,      // Increased duration
            ease: "easeOut"     // Changed easing function
          }}
        >
          <h2 className={styles.heading}>About CrackIt.AI</h2>
          
          <div className={styles.tagline}>
            <div className={styles.taglineBar}></div>
            <p>Your AI-powered career success partner</p>
          </div>
          
          <div className={styles.textContent}>
            <p>
              Job hunting without guidance? CrackIt.AI delivers expert-level feedback 
              through AI tools that elevate your career materials.
            </p>
            
            <p>
              <strong>Our mission:</strong> Make professional career tools accessible 
              to all. Let your talent shine in every application.
            </p>
            
            <motion.div 
              className={styles.features}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div className={styles.feature} variants={featureVariants} whileHover={{ scale: 1.05 }}>
                <i className="fas fa-file-alt"></i>
                <span>Resume Builder</span>
              </motion.div>
              <motion.div className={styles.feature} variants={featureVariants} whileHover={{ scale: 1.05 }}>
                <i className="fab fa-linkedin"></i>
                <span>LinkedIn Optimizer</span>
              </motion.div>
              <motion.div className={styles.feature} variants={featureVariants} whileHover={{ scale: 1.05 }}>
                <i className="fas fa-user-tie"></i>
                <span>Mock Interviews</span>
              </motion.div>
              <motion.div className={styles.feature} variants={featureVariants} whileHover={{ scale: 1.05 }}>
                <i className="fas fa-book"></i>
                <span>Learning Resources</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
