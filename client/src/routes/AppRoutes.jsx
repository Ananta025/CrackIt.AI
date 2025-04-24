import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResumePage from '../pages/ResumePage';
import LandingPage from '../pages/LandingPage';
import InterviewPage from '../pages/InterviewPage';
import LinkedinPage from '../pages/LinkedinPage';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';
import LearningPage from '../pages/LearningPage';
import SignupPage from '../pages/SignupPage';
import SigninPage from '../pages/SigninPage';



export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/linkedin" element={<LinkedinPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
