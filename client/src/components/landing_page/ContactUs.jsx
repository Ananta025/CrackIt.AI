import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './ContactUs.module.css';
import emailjs from '@emailjs/browser';

// Mapbox access token - should be in environment variables in production
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Office location coordinates
const OFFICE_LOCATION = {
  latitude: 22.5593,
  longitude: 88.3964, // Approximate coordinates for Canal S Rd, Beleghata, Kolkata
  zoom: 14
};

// For debugging - log the token (don't include in production)
console.log("Mapbox token available:", !!MAPBOX_TOKEN);

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapError, setMapError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    if (formData.contactNumber.length < 10) {
      setSubmitStatus('error');
      setErrorMessage('Please enter a valid contact number');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');
    
    try {
      // Prepare template parameters - these should match your EmailJS template variables
      const templateParams = {
        from_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact_number: formData.contactNumber,
        message: formData.message,
        to_email: 'crackit.ai@gmail.com' // This can also be set in the EmailJS template
      };
      
      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('Email sent successfully:', response);
      
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        message: ''
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to send your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Wait until the map container is actually in the DOM
    if (!mapContainer.current) return;
    
    // Check if map is already initialized
    if (map.current) return;
    
    console.log("Initializing map...");
    
    // Check if token is available
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token is missing. Please add VITE_MAPBOX_TOKEN to your environment variables.");
      setMapError(true);
      return;
    }
    
    try {
      // Set token before creating map instance
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Create a delay to ensure container is ready
      setTimeout(() => {
        if (!mapContainer.current) {
          console.error("Map container not found");
          setMapError(true);
          return;
        }
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [OFFICE_LOCATION.longitude, OFFICE_LOCATION.latitude],
          zoom: OFFICE_LOCATION.zoom
        });
        
        // Add event listeners to confirm map loaded correctly
        map.current.on('load', () => {
          console.log("Map loaded successfully");
          
          // Add marker after map loads
          new mapboxgl.Marker({color: '#FF0000'})
            .setLngLat([OFFICE_LOCATION.longitude, OFFICE_LOCATION.latitude])
            .addTo(map.current);
        });
        
        map.current.on('error', (e) => {
          console.error("Mapbox error:", e);
          setMapError(true);
        });
      }, 100);
    } catch (error) {
      console.error("Error initializing Mapbox:", error);
      setMapError(true);
    }
    
    // Cleanup
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

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
              <p><a href="tel:+9190731 41001" style={{color: 'white', textDecoration: 'none'}}>+91 - 90731 41001</a></p>
            </div>
            <div className={styles.infoItem}>
              <i className="fas fa-envelope" aria-hidden="true"></i>
              <p><a href="mailto:crackit.ai@gmail.com" style={{color: 'white', textDecoration: 'none'}}>crackit.connect@gmail.com</a></p>
            </div>
          </div>
          <div className={styles.map}>
            {mapError ? (
              // Fallback to Google Maps iframe
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.1669497281124!2d88.3938133!3d22.564542899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277a15e0c5521%3A0xef763f3115c873e4!2sCanal%20S%20Rd%2C%20Beleghata%2C%20Kolkata%2C%20West%20Bengal%20700015!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin"
                style={{border: 0, width: '100%', height: '100%', borderRadius: '15px'}}
                allowFullScreen=""
                loading="lazy"
                title="Office Location"
              ></iframe>
            ) : (
              <div 
                ref={mapContainer} 
                className={styles.mapContainer}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  minHeight: '270px',
                  position: 'relative',
                  borderRadius: '15px',
                  overflow: 'hidden'  // Ensures the border radius is applied to the map
                }} 
              />
            )}
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

          {submitStatus === 'success' && (
            <div className={styles.successMessage}>
              Thank you for contacting us! We'll get back to you soon.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className={styles.errorMessage}>
              {errorMessage || 'Something went wrong. Please try again.'}
            </div>
          )}

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <input 
                type="text" 
                name="firstName"
                placeholder="First Name" 
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <input 
                type="text" 
                name="lastName"
                placeholder="Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <input 
              type="tel" 
              name="contactNumber"
              placeholder="Contact Number" 
              value={formData.contactNumber}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.emailInput}
              disabled={isSubmitting}
            />
            <textarea 
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            ></textarea>
            <motion.button 
              type="submit"
              whileHover={{ scale: isSubmitting ? 1.0 : 1.0 }}
              whileTap={{ scale: isSubmitting ? 1.0 : 1.0 }}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Sending...' : 'Submit'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
