import React, { useState, useEffect } from 'react'
import styles from './Signin.module.css'
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import httpStatus from 'http-status';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please provide a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate all fields before submission
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return; // Stop submission if validation fails
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        email,
        password,
      });
      if (response.status === httpStatus.OK) {
        // Handle successful signup
        console.log('Signin successful');
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.userName);
        navigate('/home'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['sign-in']}>
        <div className={styles['sign-in-card']}>
            <div className={styles.card}>
                <img src="./images/signin-card.svg" alt="Sign in animation" />
            </div>
        </div>
        <div className={styles['sign-in-form']}>
            <div className={styles['form-head-txt']}>
                <p className={styles['main-txt']}>Sign in</p>
                <p className={styles['sub-txt']}>Welcome back ! Please enter your details</p>
            </div>

            <form onSubmit={handleSubmit} className={styles['signin-form']}>
                {error && <p className={styles.error}>{error}</p>}
                <div>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    className={styles['signin-input']} 
                    placeholder="Email" 
                    value={email}
                    onChange={handleEmailChange}
                    required 
                  />
                  {emailError && <p className={styles.error}>{emailError}</p>}
                </div>
                <div>
                  <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    className={styles['signin-input']} 
                    placeholder="Password" 
                    value={password}
                    onChange={handlePasswordChange}
                    required 
                  />
                  {passwordError && <p className={styles.error}>{passwordError}</p>}
                </div>
                <div className={styles['forgot-password']}>
                    <a className={styles.link} href="#">Forgot password?</a>
                </div>
                <button type="submit" disabled={isLoading} className={styles['signin-button']}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            <p>Don't have any account ? <Link className={`${styles['sign-up']} ${styles.link}`} to="/signup">Sign up</Link></p>
        </div>
    </div>
  )
}
