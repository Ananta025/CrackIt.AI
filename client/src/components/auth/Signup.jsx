import React , {useState, useEffect} from 'react'
import styles from './Signup.module.css'
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import httpStatus from 'http-status';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
    }, []);

    const validateName = (name) => {
        if (!name.trim()) {
            setNameError('Name is required');
            return false;
        }
        setNameError('');
        return true;
    };

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

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        validateName(newName);
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
        const isNameValid = validateName(name);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);
        
        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            return; // Stop submission if validation fails
        }
        
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/register`, {
                name,
                email,
                password,
            });
            if(response.status === httpStatus.CREATED) {
                // Handle successful signup
                console.log('Signup successful');
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('token', response.data.token);
                navigate('/home'); 
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles["sign-up"]}>
            <div className={styles["sign-up-card"]}>
                <div className={styles.card}>
                    <img src="./images/sign-up-animate.svg" alt="Sign up animation" />
                </div>
            </div>

            <div className={styles["sign-up-form"]}>
                <div className={styles["form-head-txt"]}>
                    <p className={styles["main-txt"]}>Create an account</p>
                    <p className={styles["sub-txt"]}>Already have an account ? <Link to="/signin"> Login</Link></p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className={styles.error}>{error}</p>}
                    <div>
                        <input 
                            type="text" 
                            className={`${styles.name} ${styles.formInput}`}
                            placeholder="Name" 
                            name="name"
                            value={name}
                            onChange={handleNameChange}
                            required 
                        />
                        {nameError && <p className={styles.error}>{nameError}</p>}
                    </div>
                    <div>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            className={`${styles["signup-details"]} ${styles.formInput}`}
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
                            className={`${styles["signup-details"]} ${styles.formInput}`}
                            placeholder="Password" 
                            value={password}
                            onChange={handlePasswordChange}
                            required 
                        />
                        {passwordError && <p className={styles.error}>{passwordError}</p>}
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}
