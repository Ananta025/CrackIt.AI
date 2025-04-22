import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResumePage from '../pages/ResumePage';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResumePage />} />
      </Routes>
    </Router>
  )
}
