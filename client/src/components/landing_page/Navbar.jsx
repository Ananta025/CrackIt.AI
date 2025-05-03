import React, { useState, useEffect, useCallback } from 'react';
import styles from './Navbar.module.css';

const NavLinks = ({ mobile = false, handleLinkClick }) => {
  // Shared navigation links for both desktop and mobile views
  const links = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '#services' },
    { name: 'About Us', url: '#about' },
    { name: 'Contact Us', url: '#contact' }
  ];

  if (mobile) {
    return (
      <>
        {links.map((link, index) => (
          <a 
            key={`mobile-${index}`} 
            href={link.url} 
            style={{ '--delay': index + 1 }}
            onClick={(e) => handleLinkClick(e, link.url)}
          >
            {link.name}
          </a>
        ))}
      </>
    );
  }

  return (
    <div className={styles.linkList}>
      {links.map((link, index) => (
        <a 
          key={`desktop-${index}`} 
          href={link.url}
          onClick={(e) => handleLinkClick(e, link.url)}
        >
          {link.name}
        </a>
      ))}
    </div>
  );
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);
  
  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(prevState => !prevState);
  
  // Handle smooth scrolling for anchor links
  const handleLinkClick = useCallback((e, url) => {
    // Handle both home URL and anchor links
    if (url === '/' || url.startsWith('#')) {
      e.preventDefault();
      
      // Close mobile menu if it's open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      
      if (url === '/') {
        // For home link, scroll to top of page smoothly
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // For anchor links, scroll to the target element
        const targetId = url.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Smooth scroll to the target element
          targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    }
  }, [isMenuOpen]);
  
  // Close mobile menu when clicking outside
  const handleClickOutside = useCallback((event) => {
    const menuButton = document.querySelector(`.${styles.mobileMenuButton}`);
    const mobileMenu = document.querySelector(`.${styles.mobileMenu}`);
    
    if (
      isMenuOpen && 
      menuButton && 
      mobileMenu && 
      !menuButton.contains(event.target) && 
      !mobileMenu.contains(event.target)
    ) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);
  
  // Set up event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleScroll, handleClickOutside]);
  
  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarContainer}>
        {/* Brand Logo */}
        <div className={styles.logo}>
          <a href="/" className={styles.logoText}>CrackIt.AI</a>
        </div>
        
        {/* Desktop Navigation */}
        <NavLinks handleLinkClick={handleLinkClick} />
        
        {/* Desktop Team Logo */}
        <div className={styles.desktopTeamLogo}>
          <i className="fa-solid fa-users-viewfinder"></i>
        </div>
        
        {/* Mobile Team Logo */}
        <div className={styles.teamLogo}>
          <i className="fa-solid fa-users-viewfinder"></i>
        </div>
        
        {/* Mobile Menu Controls */}
        <div className={styles.mobileNavContainer}>
          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton} 
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            type="button"
          >
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
          </button>
          
          {/* Mobile Menu Dropdown */}
          <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
            <NavLinks mobile={true} handleLinkClick={handleLinkClick} />
          </div>
        </div>
      </div>
    </nav>
  );
}
