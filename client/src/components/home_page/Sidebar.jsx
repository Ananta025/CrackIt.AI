import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import PropTypes from 'prop-types';

const Sidebar = ({ 
  username = "Username", 
  onLogout,
  activeFeature = "Home"
}) => {
  const navigate = useNavigate();
  
  const features = [
    { id: 'Home', name: 'Home', icon: './images/home.png', path: '/home' },
    { id: 'MockInterview', name: 'Mock Interview', icon: './images/interview.png', path: '/interview' },
    { id: 'ResumeBuild', name: 'Resume Build', icon: './images/resume.png', path: '/resume' },
    { id: 'LinkedIn', name: 'LinkedIn Optimizer', icon: './images/linkedin.png', path: '/linkedin' },
    { id: 'Quiz', name: 'Quiz', icon: './images/quiz.png', path: '/learning' },
    { id: 'Resources', name: 'Resources', icon: './images/resource.png', path: '/learning' },
    { id: 'Feedback', name: 'Feedback', icon: './images/feedback.png', path: '/feedback' },
    { id: 'Settings', name: 'Settings', icon: './images/settings.png', path: '/settings' }
  ];

  const handleFeatureClick = (featureId, path) => {
    // Navigate to the corresponding path
    navigate(path);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <p className={styles.logo}>CrackIT AI</p>
        
        <div className={styles.featuresList}>
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`${styles.features} ${activeFeature === feature.id ? styles.active : ''}`}
              onClick={() => handleFeatureClick(feature.id, feature.path)}
            >
              <img 
                className={styles.icon} 
                src={feature.icon} 
                alt={feature.name} 
              />
              <p>{feature.name}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.logout}>
        <p className={styles.username}>{username}</p>
        <button 
          className={styles.logoutButton} 
          onClick={handleLogout}
        >
          <img 
            className={styles.logoutButtonImg} 
            src="./images/logout.png" 
            alt="logout icon" 
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  username: PropTypes.string,
  onLogout: PropTypes.func,
  activeFeature: PropTypes.string
};

export default Sidebar;
