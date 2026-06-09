import { createContext, useContext, useState } from 'react';
import axios from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('erp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('erp_token'));

  const isAuthenticated = Boolean(token);

  const login = async ({ email, password }) => {
    const response = await axios.post('/login', { email, password });
    const payload = response?.data;
    if (!payload?.success || !payload?.token) {
      throw new Error(payload?.message || 'Unable to log in.');
    }

    localStorage.setItem('erp_token', payload.token);
    if (payload.user) {
      localStorage.setItem('erp_user', JSON.stringify(payload.user));
      setUser(payload.user);
    }
    setToken(payload.token);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
