import { createContext, useContext, useState, useCallback } from 'react';

export const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bv_user')); }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    // Demo mock auth — replace body with: api.post('/auth/login', { email, password })
    if (email === 'admin@bibliovault.com' && password === 'Admin@123') {
      const u = { id: 'admin1', name: 'Admin User', email, role: 'admin' };
      localStorage.setItem('bv_user', JSON.stringify(u));
      localStorage.setItem('bv_access_token', 'mock_admin_token');
      setUser(u);
      return { success: true };
    }
    if (email === 'user@bibliovault.com' && password === 'User@123') {
      const u = { id: 'user1', name: 'Jane Reader', email, role: 'user' };
      localStorage.setItem('bv_user', JSON.stringify(u));
      localStorage.setItem('bv_access_token', 'mock_user_token');
      setUser(u);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
