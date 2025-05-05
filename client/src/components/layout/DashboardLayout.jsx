import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../home_page/Sidebar';
import styles from './DashboardLayout.module.css';
import { FaBars, FaChevronLeft } from 'react-icons/fa';

export default function DashboardLayout() {
  const location = useLocation();
  const path = location.pathname.substring(1) || 'home';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      setIsSidebarOpen(!mobile); // Open on desktop, closed on mobile
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`${styles.layout} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
      <div className={`${styles.sidebarContainer} ${isSidebarOpen ? '' : styles.hidden}`}>
        <Sidebar 
          username="Username" 
          onLogout={handleLogout}
          activeFeature={pathToFeatureMap[path] || 'Home'}
          closeSidebar={closeSidebar}
          isMobileView={isMobileView}
        />
        <button 
          className={`${styles.sidebarToggle} ${styles.closeIcon}`}
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <FaChevronLeft />
        </button>
      </div>
      <main className={styles.content}>
        {!isSidebarOpen && (
          <button 
            className={styles.sidebarToggle} 
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
