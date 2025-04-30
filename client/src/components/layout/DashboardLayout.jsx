import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../home_page/Sidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const location = useLocation();
  const path = location.pathname.substring(1) || 'home';
  
  // Map route paths to sidebar feature IDs
  const pathToFeatureMap = {
    'home': 'Home',
    'interview': 'MockInterview',
    'resume': 'ResumeBuild',
    'linkedin': 'LinkedIn',
    'learning': 'Resources'
    // Add more mappings as needed
  };

  const handleLogout = () => {
    // Handle logout functionality here
    console.log('Logging out...');
    // Add actual logout logic and redirect to login page
  };

  return (
    <div className={styles.layout}>
      <Sidebar 
        username="Username" 
        onLogout={handleLogout}
        activeFeature={pathToFeatureMap[path] || 'Home'}
      />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
