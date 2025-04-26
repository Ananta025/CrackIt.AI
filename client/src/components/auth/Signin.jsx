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
  const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
    }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try{
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
            email,
            password,
        });
        if(response.status === httpStatus.OK){
            // Handle successful signup
            console.log('Signin successful');
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('token', response.data.token);
            navigate('/home'); 
        }
    }catch(err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    finally {
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

            <form onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  className={styles['signup-details']} 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  className={styles['signup-details']} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <div className={styles['forgot-password']}>
                    <a className={styles.link} href="#">Forgot password?</a>
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
                {error && <p className={styles.error}>{error}</p>}
            </form>
            <p>Don't have any account ? <Link className={`${styles['sign-up']} ${styles.link}`} to="/signup">Sign up</Link></p>
        </div>
    </div>
  )
}
