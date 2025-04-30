import React from 'react'
import HeroSection from '../components/landing_page/HeroSection'
import AboutUs from '../components/landing_page/AboutUs'
import Footer from '../components/common/Footer'
import ContactUs from '../components/landing_page/ContactUs'
import Service from '../components/landing_page/Service'
import Faq from '../components/landing_page/Faq'

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <Service />
      <AboutUs />
      <Faq />
      <ContactUs />
      <Footer />
    </div>
  )
}
