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

  return (
    <main className={styles.mainContainer}>
      <div className={styles.settings}>
        <p className={styles["settings-heading"]}>Settings</p>
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
                Change
              </button>
            </div>

            <div className={`${styles["new-password"]} ${styles.password} ${!isChangingPassword ? styles.visible : ''}`}>
              <p>Enter New Password</p>
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
              
              <input 
                className={styles.inputField}
                type="password" 
                value={formData.confirmPassword} 
                placeholder="Confirm Password" 
                name="confirmPassword" 
                required
                onChange={handleInputChange}
              />
              <button className={styles.btn}>Confirm</button>
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
