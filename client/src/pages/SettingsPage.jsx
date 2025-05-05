import React, { useState, useEffect } from 'react'
import styles from '../styles/SettingsPage.module.css'
import userService from '../services/userService'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [skill, setSkill] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(true);

  // Reset message visibility when a new message is set
  useEffect(() => {
    if (successMessage || errorMessage) {
      setIsMessageVisible(true);
    }
  }, [successMessage, errorMessage]);

  // Fetch user data including skills when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = localStorage.getItem('userId');
      
      if (storedUserId) {
        setUserId(storedUserId);
        setIsLoading(true);
        
        try {
          const userData = await userService.getUserDetails(storedUserId);
          if (userData && userData.user) {
            // Populate form data with user details
            const user = userData.user;
            
            // Handle single name field by splitting it
            let firstName = '', middleName = '', lastName = '';
            if (user.name) {
              const nameParts = user.name.trim().split(' ');
              if (nameParts.length === 1) {
                firstName = nameParts[0];
              } else if (nameParts.length === 2) {
                firstName = nameParts[0];
                lastName = nameParts[1];
              } else {
                firstName = nameParts[0];
                lastName = nameParts[nameParts.length - 1];
                middleName = nameParts.slice(1, nameParts.length - 1).join(' ');
              }
            }
            
            setFormData(prev => ({
              ...prev,
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              email: user.email || '',
              contactNumber: user.contactNumber || ''
            }));
            
            // Set skills list if available
            if (user.skills && Array.isArray(user.skills)) {
              setSkillsList(user.skills);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = () => {
    setIsChangingPassword(!isChangingPassword);
  };

  const handleNameUpdate = async () => {
    if (!userId) return;
    
    // Combine name parts to form full name
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean) // Remove empty parts
      .join(' ');
      
    if (!fullName.trim()) {
      setErrorMessage('Please enter at least your first name');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await userService.updateUserName(userId, fullName);
      setSuccessMessage('Name updated successfully!');
      setIsMessageVisible(true);
    } catch (error) {
      console.error('Error updating name:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update name');
      setIsMessageVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!userId) return;
    
    // Validation
    if (!formData.oldPassword) {
      setErrorMessage('Please enter your current password');
      return;
    }
    
    if (!formData.newPassword) {
      setErrorMessage('Please enter a new password');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await userService.updateUserPassword(userId, formData.oldPassword, formData.newPassword);
      setSuccessMessage('Password updated successfully!');
      setIsMessageVisible(true);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update password');
      setIsMessageVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (skill.trim() && userId) {
      setIsLoading(true);
      const updatedSkills = [...skillsList, skill.trim()];
      
      try {
        // Save skills to database
        await userService.updateUserSkills(userId, updatedSkills);
        
        // Update local state
        setSkillsList(updatedSkills);
        setSkill('');
      } catch (error) {
        console.error('Error adding skill:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveSkill = async (indexToRemove) => {
    if (userId) {
      setIsLoading(true);
      const updatedSkills = skillsList.filter((_, index) => index !== indexToRemove);
      
      try {
        // Update skills in database
        await userService.updateUserSkills(userId, updatedSkills);
        
        // Update local state
        setSkillsList(updatedSkills);
      } catch (error) {
        console.error('Error removing skill:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDismissMessage = () => {
    setIsMessageVisible(false);
    // Clear messages after animation completes
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 300);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.settings}>
        <p className={styles["settings-heading"]}>Settings</p>
        
        {successMessage && (
          <div className={`${styles.messageContainer} ${!isMessageVisible ? styles.messageHiding : ''}`}>
            <div className={styles.successMessage}>{successMessage}</div>
            <button 
              className={styles.messageDismiss}
              onClick={handleDismissMessage}
              aria-label="Dismiss message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        {errorMessage && (
          <div className={`${styles.messageContainer} ${!isMessageVisible ? styles.messageHiding : ''}`}>
            <div className={styles.errorMessage}>{errorMessage}</div>
            <button 
              className={styles.messageDismiss}
              onClick={handleDismissMessage}
              aria-label="Dismiss message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        <div className={styles.form}>
          <div className={styles.fullName}>
            <input 
              className={styles.inputField}
              type="text" 
              placeholder="First name" 
              value={formData.firstName} 
              name="firstName" 
              onChange={handleInputChange} 
            />
            <input 
              className={styles.inputField}
              type="text" 
              placeholder="Middle name" 
              value={formData.middleName} 
              name="middleName" 
              onChange={handleInputChange} 
            />
            <input 
              className={styles.inputField}
              type="text" 
              placeholder="Last name" 
              value={formData.lastName} 
              name="lastName" 
              onChange={handleInputChange} 
            />
            <div 
              className={styles.nameUpdateIcon} 
              onClick={handleNameUpdate}
              title="Update Name"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </div>
          </div>
          
          <div className={styles.contacts}>
            <div className={styles.email}>
              <label htmlFor="email">Email</label>
              <input 
                className={styles.inputField}
                type="email" 
                name="email" 
                id="email" 
                placeholder="Email" 
                value={formData.email}
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles["contact-no"]}>
              <label htmlFor="number">Contact Number</label>
              <input 
                className={styles.inputField}
                type="text" 
                name="contactNumber" 
                id="number" 
                placeholder="Contact Number" 
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles["password-container"]}>
            <div className={styles["old-password"] + " " + styles.password}>
              <label htmlFor="oldPassword">Password</label>
              <input 
                className={styles.inputField}
                type={showOldPassword ? "text" : "password"} 
                value={formData.oldPassword} 
                placeholder="Password" 
                name="oldPassword" 
                id="oldPassword"
                onChange={handleInputChange}
              />

              {/* An element to toggle between password visibility */}
              <div className={styles["show-password"]}>
                <input 
                  type="checkbox" 
                  className={styles["check-box"]}
                  onChange={() => setShowOldPassword(!showOldPassword)}
                />
                <p>Show Password</p>
              </div>

              <button className={styles.btn} id="changeBtn" onClick={handleChangePassword}>
                {isChangingPassword ? 'Cancel' : 'Change'}
              </button>
            </div>

            <div className={`${styles["new-password"]} ${styles.password} ${!isChangingPassword ? styles.visible : ''}`}>
              <p>Enter New Password</p>
              
              <div className={styles["password-row"]}>
                <input 
                  className={styles.inputField}
                  type={showNewPassword ? "text" : "password"} 
                  value={formData.newPassword} 
                  placeholder="New Password" 
                  name="newPassword" 
                  required
                  onChange={handleInputChange}
                />
                
                {/* An element to toggle between password visibility */}
                <div className={styles["show-password"]}>
                  <input 
                    type="checkbox" 
                    className={styles["check-box"]}
                    onChange={() => setShowNewPassword(!showNewPassword)}
                  />
                  <p>Show Password</p>
                </div>
              </div>
              
              <div className={styles["password-row"]}>
                <input 
                  className={styles.inputField}
                  type="password" 
                  value={formData.confirmPassword} 
                  placeholder="Confirm Password" 
                  name="confirmPassword" 
                  required
                  onChange={handleInputChange}
                />
                <button 
                  className={styles.btn} 
                  onClick={handlePasswordUpdate}
                  disabled={isLoading}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
          
          <hr />
          
          <div className={styles.addSkills}>
            <p className={styles.skillHeading}>Add Skills</p>
            <div className={styles.skill_list}>
              <div className={styles.add}>
                <input 
                  className={`${styles.skillAdd} ${styles.inputField}`} 
                  type="text" 
                  placeholder="Write Your Skills"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
                <button className={styles.skillAddBtn} onClick={handleAddSkill}>Add</button>
              </div>
              <div className={styles.list}>
                {skillsList.map((skill, index) => (
                  <p key={index} className={styles.skill_settings}>
                    {skill}
                    <img 
                      className={styles.cross} 
                      src="/images/cross.png" 
                      alt="" 
                      onClick={() => handleRemoveSkill(index)}
                    />
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
