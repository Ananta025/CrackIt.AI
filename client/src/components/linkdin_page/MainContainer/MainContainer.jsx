import React from 'react';
import styles from './MainContainer.module.css';
import pageStyles from '../../../styles/LinkedinPage.module.css';
import LinkSelection from '../LinkSelection/LinkSelection';
import ProfileForm from '../ProfileForm/ProfileForm';
import UrlInput from '../UrlInput/UrlInput';
import OptimizationResults from '../OptimizationResults/OptimizationResults';
import { useProfileOptimizer } from '../../../context/ProfileOptimizer';

const MainContainer = () => {
  const { selectedOption, showResults } = useProfileOptimizer();

  const renderContent = () => {
    if (showResults) {
      return <OptimizationResults />;
    }

    if (!selectedOption) {
      return <LinkSelection />;
    }

    return selectedOption === 'url' ? <UrlInput /> : <ProfileForm />;
  };

  return (
    <main className={styles["main-container"]}>
      <div className={`${styles["optimizer-container"]} ${pageStyles.glassCard}`}>
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContainer;