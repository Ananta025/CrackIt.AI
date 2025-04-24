import React from 'react'
import './HeroSection.css'


export default function HeroSection() {
  return (
    <div className="hero">
        <nav>
            <div className="navbar-compo">
                <div className="logo">
                    <a href="#">CrackIT.Ai</a>
                </div>
                <div className="link-list">
                    <a href="#">Home</a>
                    <a href="#">About Us</a>
                    <a href="#">Services</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
        </nav>
         <div className="hero-txt">
            <p id="hero-main-txt">Crack Your Next <br/><span id="interview">Interview</span> with<br/>Confidence 
            </p>
            <p id="hero-sub-txt"> Powered by<span id="ai-txt">AI</span><img src="./images/AI star.png" alt="Ai logo"/>
            </p>
         </div>

          <div className="hero-img">
            <img src="./images/Group 36.png" alt="hero section image"/>
          </div>
          <div className="get-started-btn">
            <a href="/signup" id="get-started">Get Started</a>
          </div>
    </div>
  )
}
