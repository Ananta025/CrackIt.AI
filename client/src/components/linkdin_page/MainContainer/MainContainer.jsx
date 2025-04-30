import React from 'react';
import styles from './MainContainer.module.css';
import pageStyles from '../../../styles/LinkedinPage.module.css';
import LinkSelection from '../LinkSelection/LinkSelection';
import ProfileForm from '../ProfileForm/ProfileForm';
import UrlInput from '../UrlInput/UrlInput';
import { useProfileOptimizer } from '../../../context/ProfileOptimizer';

const MainContainer = () => {
  const { selectedOption } = useProfileOptimizer();

  return (
    <main className={styles["main-container"]}>
      <div className={`${styles["optimizer-container"]} ${pageStyles.glassCard}`}>
        {!selectedOption ? (
          <LinkSelection />
        ) : selectedOption === 'url' ? (
          <UrlInput />
        ) : (
          <ProfileForm />
        )}
      </div>
    </main>
  );
};

export default MainContainer;