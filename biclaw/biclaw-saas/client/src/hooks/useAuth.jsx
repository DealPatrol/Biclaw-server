import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('biclaw_token');
    if (token) {
      api.me().then(({ user }) => setUser(user)).catch(() => localStorage.removeItem('biclaw_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('biclaw_token', token);
    setUser(user);
    return user;
  };

  const register = async (email, password, name, company) => {
    const { token, user } = await api.register({ email, password, name, company });
    localStorage.setItem('biclaw_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('biclaw_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
