// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/crm_front_react/login" />;
  }

  return <>{element}</>;
};

export default ProtectedRoute;
