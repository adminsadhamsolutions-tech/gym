import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/auth.php', { email, password });
    const token = response.data.token;
    localStorage.setItem('erp_token', token);
    setUser({ token });
    return response;
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
