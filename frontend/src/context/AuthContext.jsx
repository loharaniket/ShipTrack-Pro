import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users');
      setCurrentUser(response.data.data);
    } catch (error) {
      setCurrentUser(null);
      localStorage.removeItem('shiptrack_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('shiptrack_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken } = response.data.data;
    localStorage.setItem('shiptrack_token', token);
    localStorage.setItem('shiptrack_refresh_token', refreshToken);
    await fetchProfile();
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, refreshToken } = response.data.data;
    localStorage.setItem('shiptrack_token', token);
    localStorage.setItem('shiptrack_refresh_token', refreshToken);
    await fetchProfile();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('shiptrack_token');
      localStorage.removeItem('shiptrack_refresh_token');
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
