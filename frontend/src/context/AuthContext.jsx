'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user & token from localStorage or fetch profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Failed to parse cached user data', e);
            }
          }

          // Fetch fresh user profile from backend
          try {
            const res = await apiClient.get('/auth/me');
            if (res.data && res.data.success) {
              setUser(res.data.data.user);
              localStorage.setItem('user_data', JSON.stringify(res.data.data.user));
            } else {
              setToken(null);
              setUser(null);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
          } catch (err) {
            console.warn('Token verification error:', err.message);
            if (err.response?.status === 401 || err.response?.status === 403) {
              setToken(null);
              setUser(null);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').toLowerCase().trim();

    try {
      const res = await apiClient.post('/auth/login', { email: cleanEmail, password });
      if (res.data && res.data.success) {
        const { token: authToken, user: userData } = res.data.data;

        setToken(authToken);
        setUser(userData);

        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        setLoading(false);
        return { success: true, user: userData };
      }
      setLoading(false);
      return { success: false, message: res.data?.message || 'بيانات الدخول غير صحيحة.' };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout endpoint warning:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
