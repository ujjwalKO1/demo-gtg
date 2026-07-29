import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";

// Pages
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import StaticPage from './pages/StaticPage';

// Layout wrapper for responsive main shell
const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideShell = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="main-layout pb-20 sm:pb-0">
      {!hideShell && <Header />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {!hideShell && <Footer />}
      {!hideShell && <BottomNav />}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FAF7F2',
            color: '#291002',
            border: '2px solid #121212',
            boxShadow: '4px 4px 0px 0px #121212',
            borderRadius: '12px',
            fontWeight: '600'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FAF7F2',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FAF7F2',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Static Pages */}
            <Route path="/about" element={<StaticPage title="About Us" content={<p>Get-To-Gather is a platform designed to bring local communities together. Whether you are looking to host a small meetup, a local sports match, or a tech networking event, we make it easy to turn plans into memories.</p>} />} />
            <Route path="/contact" element={<StaticPage title="Contact" content={<p>Have a question or feedback? Reach out to our support team at <strong>support@get-to-gather.com</strong>. We aim to respond to all inquiries within 24 hours.</p>} />} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" content={<><p>Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information.</p><h3 className="text-xl font-bold mt-4 mb-2">1. Data Collection</h3><p>We collect information you provide directly, such as your name, email, and location data when using our map features.</p><h3 className="text-xl font-bold mt-4 mb-2">2. Data Usage</h3><p>Your data is used to provide and improve the Get-To-Gather platform, match you with relevant events, and ensure platform safety.</p></>} />} />
            <Route path="/terms" element={<StaticPage title="Terms of Service" content={<><p>By using Get-To-Gather, you agree to these terms. Please read them carefully.</p><h3 className="text-xl font-bold mt-4 mb-2">1. User Conduct</h3><p>Users must behave respectfully. Harassment, spam, or illegal activities will result in immediate account termination.</p><h3 className="text-xl font-bold mt-4 mb-2">2. Event Liability</h3><p>Get-To-Gather is a platform for organizing events. We are not responsible for the safety or outcome of the events themselves.</p></>} />} />
            <Route path="/safety" element={<StaticPage title="Safety Guidelines" content={<><p>We want every Get-To-Gather event to be a safe and welcoming experience.</p><ul className="list-disc pl-5 mt-4 space-y-2"><li>Always meet in public places for the first time.</li><li>Tell a friend or family member where you are going.</li><li>Trust your instincts. If something feels off, leave.</li><li>Report any suspicious behavior to our moderation team immediately.</li></ul></>} />} />

            {/* Protected Routes */}
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Analytics />
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
