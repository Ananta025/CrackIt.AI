import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import PropTypes from 'prop-types';

const Sidebar = ({
  name: propName, 
  onLogout,
  activeFeature = "Home"
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(propName || "User");

  useEffect(() => {
    // If name is provided via props, use that
    if (propName) {
      setUserName(propName);
      return;
    }
    
    // First check if complete user object is available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) {
          setUserName(parsedUser.name);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // If not, check if only userId is available
    const userId = localStorage.getItem('userId');
    if (userId) {
      // Fetch user details using the ID
      fetchUserDetails(userId);
    }
  }, [propName]);

  const fetchUserDetails = async (userId) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${backendUrl}/api/user/get-user-details/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        // Access name from the nested user object
        if (userData.user && userData.user.name) {
          setUserName(userData.user.name);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const features = [
    { id: 'Home', name: 'Home', icon: './images/home.png', path: '/home' },
    { id: 'MockInterview', name: 'Mock Interview', icon: './images/interview.png', path: '/interview' },
    { id: 'ResumeBuild', name: 'Resume Build', icon: './images/resume.png', path: '/resume' },
    { id: 'LinkedIn', name: 'LinkedIn Optimizer', icon: './images/linkedin.png', path: '/linkedin' },
    // { id: 'Quiz', name: 'Quiz', icon: './images/quiz.png', path: '/learning' },
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

  // Get first letter of name and capitalize it
  const nameInitial = userName.charAt(0).toUpperCase();

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
      
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <span>{nameInitial}</span>
          </div>
          <p className={styles.userName}>{userName}</p>
        </div>
        <div 
          className={`${styles.features} ${styles.logoutFeature}`}
          onClick={handleLogout}
        >
          <img 
            className={`${styles.icon} ${styles.logoutIcon}`}
            src="./images/logout.png" 
            alt="logout" 
          />
          <p>Logout</p>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  name: PropTypes.string,
  onLogout: PropTypes.func,
  activeFeature: PropTypes.string
};

export default Sidebar;
