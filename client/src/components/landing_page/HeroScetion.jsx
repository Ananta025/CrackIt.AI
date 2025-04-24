import React from 'react'

export default function HeroScetion() {
  return (
    <div class="hero">
        <navbar>
            <div class="navbar-compo">
                <div class="logo">
                    <a href="#">CrackIT.Ai</a>
                </div>
                <div class="link-list">
                    <a href="#">Home</a>
                    <a href="#">About Us</a>
                    <a href="#">Services</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
        </navbar>



        

         <div class="hero-txt">
            <p id="hero-main-txt">Crack Your Next <br/><span id="interview">Interview</span> with<br/>Confidence 
            </p>
            <p id="hero-sub-txt"> Powered by<span id="ai-txt">AI</span><img src="./images/AI star.png" alt="Ai logo"/>
            </p>
         </div>

          <div class="hero-img">
            <img src="./images/Group 36.png" alt="hero section image"/>
          </div>
          <div class="get-started-btn">
            <a href="#" id="get-started">Get Started</a>
          </div>
    </div>
  )
}
