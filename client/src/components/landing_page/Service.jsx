import React from 'react'
import styles from './Service.module.css'
import { motion } from 'framer-motion'

export default function Service() {
  // Define animation variants
  const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.0, ease: "easeOut" } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 } 
    }
  };

  return (
    <>
      <div className={styles["service-container"]} id="services">
        <motion.div 
          className={styles.heading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={headingVariants}
        >
            <p className={styles["main-heading"]}>Powerful Features</p>
            <p className={styles["main-heading"]}>just for you</p>
            <p className={styles["sub-heading"]}>Our website offers a range of powerful features designed to<br/>elevate your Interview preparation journey</p>
        </motion.div>

        {/* service card section */}
        <div className={styles.service}>
            <motion.div 
              className={`${styles.upper} ${styles.row}`}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
                <motion.div 
                  className={styles.card} 
                  id={styles["card-1"]}
                  variants={cardVariants}
                >
                    <img className={styles.icon} src="/images/interview.png" alt="AI Interview Feature" loading="lazy"/>
                    <p className={styles.title}>AI Powered Mock Interview</p>
                    <p className={styles.details}>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum
                    </p>
                </motion.div>
                <motion.div 
                  className={styles.card} 
                  id={styles["card-2"]}
                  variants={cardVariants}
                >
                    <img className={styles.icon} src="/images/resume.png" alt="Resume Analysis Feature" loading="lazy"/>
                    <p className={styles.title}>Resume Build & Analyze</p>
                    <p className={styles.details}>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. 
                    </p>
                </motion.div>
            </motion.div>
            <motion.div 
              className={`${styles.lower} ${styles.row}`}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
                <motion.div 
                  className={styles.card} 
                  id={styles["card-3"]}
                  variants={cardVariants}
                >
                    <img className={styles.icon} src="./images/linkedin.png" alt="LinkedIn Optimization Feature" loading="lazy"/>
                    <p className={styles.title}>LinkedIn Optimizer</p>
                    <p className={styles.details}>It is a long established fact that a reader will be distracted by the readable content of a 
                    </p>
                </motion.div>
                <motion.div 
                  className={styles.card} 
                  id={styles["card-4"]}
                  variants={cardVariants}
                >
                    <img className={styles.icon} src="./images/quiz.png" alt="Interview Quiz Feature" loading="lazy"/>
                    <p className={styles.title}>Interview Quiz</p>
                    <p className={styles.details}>It is a long established fact that a reader will be distracted by the readable content of a 
                    </p>
                </motion.div>
                <motion.div 
                  className={styles.card} 
                  id={styles["card-5"]}
                  variants={cardVariants}
                >
                    <img className={styles.icon} src="./images/pdf.png" alt="Preparation Resources" loading="lazy"/>
                    <p className={styles.title}>Preparation Resource</p>
                    <p className={styles.details}>It is a long established fact that a reader will be distracted by the readable content of a
                    </p>
                </motion.div>
            </motion.div>
        </div>
      </div>
    </>
  )
}
