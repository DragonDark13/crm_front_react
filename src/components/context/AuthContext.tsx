// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean; // Нове значення для перевірки автентифікації
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || null);

  const login = useCallback((token: string) => {
    setToken(token);
    localStorage.setItem('token', token); // Зберігаємо токен в localStorage
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token'); // Очищаємо токен з localStorage
  }, []);

  const isAuthenticated = !!token; // Перевірка, чи є токен

  const contextValue = useMemo(() => ({
    token,
    isAuthenticated,
    login,
    logout
  }), [token, isAuthenticated, login, logout]);

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
