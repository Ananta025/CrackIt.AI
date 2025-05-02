import React, { useState } from 'react'
import styles from '../styles/SettingsPage.module.css'

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

  const handleAddSkill = () => {
    if (skill.trim()) {
      setSkillsList(prev => [...prev, skill]);
      setSkill('');
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkillsList(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.settings}>
        <p className={styles["settings-heading"]}>Settings</p>
        <div className={styles.form}>
          <div className={styles.fullName}>
            <input 
              type="text" 
              placeholder="First name" 
              value={formData.firstName} 
              name="firstName" 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              placeholder="Middle name" 
              value={formData.middleName} 
              name="middleName" 
              onChange={handleInputChange} 
            />
            <input 
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
                type={showOldPassword ? "text" : "password"} 
                value={formData.oldPassword} 
                placeholder="Password" 
                name="oldPassword" 
                className={styles.pass} 
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
                type={showNewPassword ? "text" : "password"} 
                value={formData.newPassword} 
                placeholder="New Password" 
                name="newPassword" 
                className={styles.pass} 
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
                  className={styles.skillAdd} 
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
