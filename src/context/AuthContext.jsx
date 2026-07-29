import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register User
  const register = async (name, email, password, referredByCode = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, referredByCode })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(data.message || 'Invalid credentials');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (credential, referredByCode = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token: credential, referredByCode })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(data.message || 'Google login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
      return { success: false, message: 'Server connection error.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update Profile details (bio, avatar)
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Network error updating profile.' };
    }
  };

  // Verify Identity Mock (DigiLocker)
  const verifyIdentity = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Identity verification failed due to network error.' };
    }
  };

  // Verify Phone Number (Firebase SMS Mock/Real)
  const verifyPhone = async (phone) => {
    try {
      const response = await fetch('/api/auth/firebase-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ phone })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Phone verification failed.' };
    }
  };

  // Refresh User State from server
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error refreshing user context:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        verifyIdentity,
        verifyPhone,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
