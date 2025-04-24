import React from 'react'
import './Signup.css'

export default function Signup() {
  return (
    <div className="sign-up">

        <div className="sign-up-card">
            <div className="card">
                <img src="./images/sign-up-animate.svg" alt=""/>
            </div>
        </div>

        <div className="sign-up-form">
            <div className="form-head-txt">
                <p id="main-txt">Create an account</p>
                 <p id="sub-txt">Already have an account ? <a href="/signin"> Login</a></p>
            </div>

            <form action="#">
                <div className="fullname">
                    <input type="text" className="name" placeholder="First Name" name="firstName"  required />
                    <input type="text" className="name" placeholder="Last Name" name="lastName"  required />
                </div>
                <input type="email" name="email" id="email" className="signup-details" placeholder="Email" required />
                <input type="password" name="password" id="password" className="signup-details" placeholder="Password" required />
                <button type="submit">Create Account</button>
            </form>
        </div>
    </div>
  )
}
