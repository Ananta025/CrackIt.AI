import React from 'react'
import HeroSection from '../components/landing_page/HeroSection'
import AboutUs from '../components/landing_page/AboutUs'
import Footer from '../components/common/Footer'
import ContactUs from '../components/landing_page/ContactUs'

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <AboutUs />
      <ContactUs />
      <Footer />
    </div>
  )
}
