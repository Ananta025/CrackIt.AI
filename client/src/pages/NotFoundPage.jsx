import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>404</h1>
      <p className={styles.message}>Page Not Found</p>
      <p className={styles.hint}>Sorry, the page you are looking for does not exist.</p>
      <p className={styles.hint}>Please check the URL or return to the homepage.</p>
      <button className={styles.homeButton} onClick={goToHomePage}>
        Return to Homepage
      </button>
    </div>
  )
}
