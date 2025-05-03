import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import styles from './ContactUs.module.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    console.log(formData);
  };

  return (
    <div className={styles.pageContainer} id="contact">
      <div className={styles.content}>
        <motion.div 
          className={styles.leftSection}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
              <p>Canal S Rd, Beleghata, Kolkata, West Bengal 700015</p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-phone" aria-hidden="true"></i>
              <p><a href="tel:+919999999999" style={{color: 'white', textDecoration: 'none'}}>+91-9999999999</a></p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-envelope" aria-hidden="true"></i>
              <p><a href="mailto:crackit.ai@gmail.com" style={{color: 'white', textDecoration: 'none'}}>crackit.ai@gmail.com</a></p>
            </div>
          </div>
          <div className={styles.map}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18..."
              allowFullScreen=""
              loading="lazy"
              title="Office Location"
            ></iframe>
          </div>
        </motion.div>

        <motion.div 
          className={styles.rightSection}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className={styles.header}>
            <h1>Get in touch</h1>
            <p>Got questions or ideas? We'd love to hear from you.<br />Drop us a message and we'll get back to you as soon as possible.</p>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <input 
              type="tel" 
              name="contactNumber"
              placeholder="Contact Number" 
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea 
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Submit
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
