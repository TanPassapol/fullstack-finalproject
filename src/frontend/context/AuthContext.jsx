import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bv_user')); }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('bv_user',         JSON.stringify(data.user));
      localStorage.setItem('bv_access_token', data.accessToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message || 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bv_user');
    localStorage.removeItem('bv_access_token');
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }