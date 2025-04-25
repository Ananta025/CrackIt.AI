import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.flexContainer}>
            <div className={styles.companySection}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <i className="fa-brands fa-airbnb text-md text-white"></i>
                </div>
                <h2 className={styles.logoText}>CrackIt.AI</h2>
              </div>
              <p className={styles.description}>
                Lorem ipsum od chet dllogi. Bell trabel, samtidigt, ohöbel utom
                diska. Jinesade bel när feras redorade i belogi. FÄR paratyp i
                muväning, och pesask vyfiasat. Viktiga poddradio har un mad och
                inde.
              </p>
              <div className={styles.socialIcons}>
                <a href="#" className={`${styles.socialIcon} ${styles.facebook}`}>
                  <i className="fab fa-facebook-f text-white"></i>
                </a>
                <a href="#" className={`${styles.socialIcon} ${styles.twitter}`}>
                  <i className="fab fa-twitter text-white"></i>
                </a>
                <a href="#" className={`${styles.socialIcon} ${styles.linkedin}`}>
                  <i className="fab fa-linkedin-in text-white"></i>
                </a>
                <a href="#" className={`${styles.socialIcon} ${styles.instagram}`}>
                  <i className="fab fa-instagram text-white"></i>
                </a>
              </div>
            </div>
            <div className={styles.linksContainer}>
              <div className={styles.linksSection}>
                <h3 className={styles.linksTitle}>Pages</h3>
                <ul className={styles.linksList}>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.linksSection}>
                <h3 className={styles.linksTitle}>Services</h3>
                <ul className={styles.linksList}>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Resume Builder
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Quiz Generator
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      Star Answer Builder
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      LinkedIn Optimizer
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.linkItem}>
                      <i className={`fas fa-chevron-right ${styles.linkIcon}`}></i>
                      AI Interview Coach
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.linksSection}>
                <h3 className={styles.linksTitle}>Contact</h3>
                <ul className={styles.linksList}>
                  <li className={styles.contactItem}>
                    <i className={`fas fa-phone-alt ${styles.contactIcon}`}></i>
                    <span>+91 90731 41001</span>
                  </li>
                  <li className={styles.contactItem}>
                    <i className={`fas fa-envelope ${styles.contactIcon}`}></i>
                    <span>crackit.ai@gmail.com</span>
                  </li>
                  <li className={styles.contactItem}>
                    <i className={`fas fa-globe ${styles.contactIcon}`}></i>
                    <span>Earth</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className={styles.copyright}>
            <p>&copy; {new Date().getFullYear()} CrackIt.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
