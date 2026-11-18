import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { axiosInstance } from '../../api/api';

interface AuthContextType {
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  authReady: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [roles, setRoles] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const clearSession = () => {
    setToken(null);
    setRoles([]);
    localStorage.removeItem('token');
  };

  const validateSession = async (currentToken: string) => {
    try {
      const response = await axiosInstance.get('/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setToken(currentToken);
      setRoles(Array.isArray(response.data.roles) ? response.data.roles : []);
    } catch {
      clearSession();
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      void validateSession(storedToken);
    } else {
      setAuthReady(true);
    }
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setAuthReady(false);
    await validateSession(newToken);
    if (!localStorage.getItem('token')) {
      throw new Error('Session validation failed');
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem('token')) {
        await axiosInstance.post('/logout', {});
      }
    } finally {
      clearSession();
      setAuthReady(true);
    }
  };

  const isAuthenticated = !!token && roles.length > 0;

  return (
    <AuthContext.Provider value={{ token, roles, isAuthenticated, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
