import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layout/Layout';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import Mentorship from './pages/Mentorship';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';

function MainRouter() {
  const { user } = useAuth();
  const [view, setView] = useState('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout view={view} setView={setView}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'users' && <AdminUsers />}
      {view === 'directory' && <Directory />}
      {view === 'events' && <Events />}
      {view === 'jobs' && <Jobs />}
      {view === 'mentorship' && <Mentorship />}
      {view === 'profile' && <Profile />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
