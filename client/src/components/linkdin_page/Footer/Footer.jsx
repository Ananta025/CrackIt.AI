import React from 'react';
import styles from './Footer.module.css';
import pageStyles from '../../../styles/LinkedinPage.module.css';

const Footer = () => {
  return (
    <footer className={`${styles.footer} ${pageStyles.linkedinPageWrapper}`}>
      <p>© {new Date().getFullYear()} LinkedIn Profile Optimizer | Part of AI Interview Prep</p>
      <div className={styles["footer-links"]}>
        <a href="#" className={styles["footer-link"]}>Privacy Policy</a>
        <a href="#" className={styles["footer-link"]}>Terms of Service</a>
        <a href="#" className={styles["footer-link"]}>Contact Us</a>
      </div>
    </footer>
  );
};

export default Footer;