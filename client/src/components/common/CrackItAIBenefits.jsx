import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './CrackItAIBenefits.module.css';

export default function CrackItAIBenefits() {
  const beneficiaries = [
    {
      title: "Students and recent graduates",
      description: "Practice answering tailored interview questions and gain confidence for your job search.",
      image: "/images/benefit1.svg"
    },
    {
      title: "Job seekers and Candidates",
      description: "Practice answering common interview questions and improve your performance.",
      image: "/images/benefit2.svg"
    },
    {
      title: "Remote Workers and Freelancers",
      description: "Ace virtual job interviews with AI-generated tailored questions and personalized feedback.",
      image: "/images/benefit3.svg"
    }
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 40
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.tagline}>OUR USERS</p>
        <h2 className={styles.title}>Who can benefit from CrackIt.AI?</h2>
      </div>

      <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInUp}
        className={styles.grid}
      >
        {beneficiaries.map((item, index) => (
          <div 
            key={index} 
            className={styles.card}
          >
            <div className={styles.imageContainer}>
              <img 
                src={item.image} 
                alt={item.title} 
                className={styles.image}
              />
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDescription}>{item.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
