import { createContext, useContext, useState } from 'react';
import axios from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const AUTO_LOGIN = (import.meta.env.VITE_AUTO_LOGIN || import.meta.env.VITE_DEV_AUTO_LOGIN) === 'true';
  const [user, setUser] = useState(() => {
    const existing = localStorage.getItem('erp_token');
    if (existing) return existing;
    if (AUTO_LOGIN) {
      const token = `dev-token-${Date.now()}`;
      localStorage.setItem('erp_token', token);
      return token;
    }
    return null;
  });

  const login = async (email, password) => {
    if (AUTO_LOGIN) {
      // Development shortcut: bypass backend auth
      const token = `dev-token-${Date.now()}`;
      localStorage.setItem('erp_token', token);
      setUser(token);
      return;
    }

    const res = await axios.post('/login', { email, password });

    if (res.data.success) {
      localStorage.setItem('erp_token', res.data.token);
      setUser(res.data.token);
    } else {
      throw new Error(res.data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);