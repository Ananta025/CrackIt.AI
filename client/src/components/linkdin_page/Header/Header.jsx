import React from 'react';
import styles from './Header.module.css';
import { Linkedin } from 'lucide-react';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Linkedin size={36} className={styles["logo-icon"]} />
        <h1>
          <span className={styles["text-gradient"]}>LinkedIn</span> Profile Optimizer
        </h1>
      </div>
      <p className={styles.tagline}>Boost your career with AI-powered profile optimization</p>
    </header>
  );
};

export default Header;