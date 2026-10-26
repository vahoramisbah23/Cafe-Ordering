import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cafe_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cafe_auth_token') || null;
  });

  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'admin'

  // Persist session to localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('cafe_auth_user', JSON.stringify(user));
      localStorage.setItem('cafe_auth_token', token);
    } else {
      localStorage.removeItem('cafe_auth_user');
      localStorage.removeItem('cafe_auth_token');
    }
  }, [user, token]);

  const login = async (email, password, requestedRole = null) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password, requestedRole });
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        setAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password, role = 'customer') => {
    setLoading(true);
    try {
      const res = await registerUser({ name, email, phone, password, role });
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        setAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cafe_auth_user');
    localStorage.removeItem('cafe_auth_token');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
