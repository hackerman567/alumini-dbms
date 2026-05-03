import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AlumniDirectory from './pages/AlumniDirectory';
import Mentorship from './pages/Mentorship';
import JobBoard from './pages/JobBoard';
import Events from './pages/Events';
import Donations from './pages/Donations';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Capsule from './pages/Capsule';
import HallOfFame from './pages/HallOfFame';
import Messaging from './pages/Messaging';
import Polls from './pages/Polls';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

import Cursor from './components/Cursor';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Cursor />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="directory" element={<AlumniDirectory />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route path="jobs" element={<JobBoard />} />
            <Route path="events" element={<Events />} />
            <Route path="donations" element={<Donations />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="capsule" element={<Capsule />} />
            <Route path="hall-of-fame" element={<HallOfFame />} />
            <Route path="messages" element={<Messaging />} />
            <Route path="polls" element={<Polls />} />
            <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
            
            {/* Admin Only */}
            <Route path="admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
