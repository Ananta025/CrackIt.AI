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
import SettingsPage from '../pages/SettingsPage';

// Protected Route component
const ProtectedRoute = ({ children, redirectTo = "/" }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    // Redirect to login page with return path
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }
  
  return children;
};
// Check if user is authenticated and redirect to home if trying to access public routes
const PublicOnlyRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public routes - accessible without login */}
        <Route path="/" element={
          <PublicOnlyRoute>
            <LandingPage />
          </PublicOnlyRoute>
        } />
        <Route path="/signup" element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        } />
        <Route path="/signin" element={
          <PublicOnlyRoute>
            <SigninPage />
          </PublicOnlyRoute>
        } />
        
        {/* Protected routes with DashboardLayout */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/home" element={<HomePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/linkedin" element={<LinkedinPage />} />
          <Route path="/learning" element={<LearnQuizPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add more routes here for other features */}
          
          {/* Handle 404 for authenticated users (inside dashboard) */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Public 404 page for unauthenticated users */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
