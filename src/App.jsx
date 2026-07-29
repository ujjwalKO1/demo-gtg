import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout wrapper for responsive main shell
const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideShell = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="main-layout">
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
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
