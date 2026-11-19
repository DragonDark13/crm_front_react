import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [roles, setRoles] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);

  const clearSession = useCallback(() => {
    setToken(null);
    setRoles([]);
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setAuthReady(true);
      return;
    }

    axiosInstance.get('/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    }).then(response => {
      if (localStorage.getItem('token') !== storedToken) return;
      setToken(storedToken);
      setRoles(Array.isArray(response.data.roles) ? response.data.roles : []);
    }).catch(() => {
      if (localStorage.getItem('token') === storedToken) {
        clearSession();
        setAuthReady(true);
      }
    }).finally(() => {
      if (localStorage.getItem('token') === storedToken) {
        setAuthReady(true);
      }
    });
  }, [clearSession]);

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setAuthReady(false);

    try {
      const response = await axiosInstance.get('/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (localStorage.getItem('token') !== newToken) return;
      setRoles(Array.isArray(response.data.roles) ? response.data.roles : []);
      setAuthReady(true);
    } catch (error) {
      if (localStorage.getItem('token') === newToken) {
        clearSession();
        setAuthReady(true);
      }
      throw error;
    }
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('token')) {
        await axiosInstance.post('/logout', {});
      }
    } finally {
      clearSession();
      setAuthReady(true);
    }
  }, [clearSession]);

  const isAuthenticated = !!token && roles.length > 0;

  const contextValue = useMemo(() => ({
    token,
    roles,
    isAuthenticated,
    authReady,
    login,
    logout
  }), [token, roles, isAuthenticated, authReady, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
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
