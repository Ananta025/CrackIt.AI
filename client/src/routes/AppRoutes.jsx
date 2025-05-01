import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResumePage from '../pages/ResumePage';
import LandingPage from '../pages/LandingPage';
import InterviewPage from '../pages/InterviewPage';
import LinkedinPage from '../pages/LinkedinPage';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';
import LearnQuizPage from '../pages/LearnQuizPage';
import SignupPage from '../pages/SignupPage';
import SigninPage from '../pages/SigninPage';
import DashboardLayout from '../components/layout/DashboardLayout';

// Protected Route component
const ProtectedRoute = ({ children, redirectTo = "/signin" }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }
  
  return children;
};

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        
        {/* Protected routes with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/resume" element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          } />
          <Route path="/linkedin" element={
            <ProtectedRoute>
              <LinkedinPage />
            </ProtectedRoute>
          } />
          <Route path="/learning" element={
            <ProtectedRoute>
              <LearnQuizPage />
            </ProtectedRoute>
          } />
          {/* Add more routes here for other features */}
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
