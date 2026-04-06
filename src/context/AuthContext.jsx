import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to get auth data directly from sessionStorage
const getAuthFromStorage = () => {
  const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const userData = sessionStorage.getItem('userData');
  return {
    isLoggedIn: loggedIn,
    user: userData ? JSON.parse(userData) : null
  };
};

export const AuthProvider = ({ children }) => {
  // Initialize state directly from sessionStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });
  
  const [user, setUser] = useState(() => {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    // Check sessionStorage on mount for any updates
    const { isLoggedIn: loggedIn, user: userData } = getAuthFromStorage();
    setIsLoggedIn(loggedIn);
    setUser(userData);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userData', JSON.stringify(userData));
    // Store userEmail separately for Products page compatibility
    if (userData && userData.email) {
      sessionStorage.setItem('userEmail', userData.email);
    }
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
