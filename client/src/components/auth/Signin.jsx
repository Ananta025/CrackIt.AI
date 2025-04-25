import React from 'react'
import './Signin.css'

export default function Signin() {
  return (
    <div className="sign-in">
        <div className="sign-in-card">
            <div className="card">
                <img src="./images/signin-card.svg" alt="" />
            </div>
        </div>
        <div className="sign-in-form">
            <div className="form-head-txt">
                <p id="main-txt">Sign in</p>
                 <p id="sub-txt">Welcome back ! Please enter your details</p>
            </div>

            <form action="#">
                <input type="email" name="email" id="email" className="signup-details" placeholder="Email" required />
                <input type="password" name="password" id="password" className="signup-details" placeholder="Password" required />
                <div className="forgot-password">
                    <a classNameName="link" href="#">Forgot password?</a>
                </div>
                <button type="submit">Sign in</button>
            </form>
            <p>Don’t have any account ? <a classNameName="sign-up link"href="signup">Sign up</a></p>
        </div>
    </div>
  )
}
