import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [guestSessionId, setGuestSessionId] = useState(null);

  useEffect(() => {
    let sessionId = localStorage.getItem('guestSessionId');

    // Validate UUID format
    const isValidUUID = (str) => {
      return typeof str === 'string' && 
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    };
    
    if (!sessionId || !isValidUUID(sessionId)) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      localStorage.setItem('guestSessionId', sessionId);
    }

    setGuestSessionId(sessionId);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const localToken = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      const sessionToken = sessionStorage.getItem('token');
      const sessionUser = sessionStorage.getItem('user');

      if (localToken && localUser) {
        setUser(JSON.parse(localUser));
        setIsAuthenticated(true);
        setIsGuest(false);
      } else if (sessionToken && sessionUser) {
        setUser(JSON.parse(sessionUser));
        setIsAuthenticated(true);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Auth check failed', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
    setIsGuest(true);
    window.location.href = '/'
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };

    if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(newUserData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(newUserData));
    }
    
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isGuest,
    guestSessionId,
    login,
    logout,
    updateUser,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};