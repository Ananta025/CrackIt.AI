import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResumePage from '../pages/ResumePage';
import LandingPage from '../pages/LandingPage';
import InterviewPage from '../pages/InterviewPage';
import LinkdinPage from '../pages/LinkdinPage';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';



export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/linkdin" element={<LinkdinPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
