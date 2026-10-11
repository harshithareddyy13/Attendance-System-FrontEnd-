import { createContext, useContext, useState } from 'react';
import { api, getAuth, setAuth, clearAuth } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuthState] = useState(getAuth());

  async function login(username, password) {
    const data = await api.post('/auth/login', { username, password });
    setAuth(data);
    setAuthState(data);
    return data;
  }

  function logout() {
    clearAuth();
    setAuthState(null);
  }

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) =>
  role === 'ADMIN' ? '/admin' : role === 'FACULTY' ? '/faculty' : '/student';
