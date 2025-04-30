import React from 'react'
import { ProfileOptimizerProvider } from '../context/ProfileOptimizer.jsx'
import Header from '../components/linkdin_page/Header/Header'
import MainContainer from '../components/linkdin_page/MainContainer/MainContainer'
import styles from '../styles/LinkedinPage.module.css'

export default function LinkedinPage() {
  return (
    <ProfileOptimizerProvider>
      <div className={styles.linkedinPageWrapper}>
        <div className={styles.app}>
          <div className={styles.background}></div>
          <div className={styles.content}>
            <Header />
            <MainContainer />
          </div>
        </div>
      </div>
    </ProfileOptimizerProvider>
  )
}
