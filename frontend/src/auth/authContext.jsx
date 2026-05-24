import { createContext, useContext, useState } from 'react';
import axios from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('erp_token'));

  const login = async (email, password) => {
    const res = await axios.post('/auth.php', { email, password });

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