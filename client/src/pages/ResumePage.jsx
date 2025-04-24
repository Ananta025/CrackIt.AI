import React from 'react'
import HeroSection from '../components/resume_page/HeroSection'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import TamplateSection from '../components/resume_page/TamplateSection'
import CrackItAIBenefits from '../components/common/CrackItAIBenefits'
import ResumeFAQ from '../components/resume_page/ResumeFAQ'
import ChatbotWidget from '../components/chatbot/ChatbotWidget'

export default function ResumePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <TamplateSection />
      <CrackItAIBenefits />
      <ResumeFAQ />
      <Footer />
      <ChatbotWidget />
    </div>
  )
}
