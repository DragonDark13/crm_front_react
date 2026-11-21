import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const { isAuthenticated, roles, authReady } = useAuth();

  if (!authReady) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/crm_front_react/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => roles.includes(role))) {
    const fallbackPath = roles.includes('guest')
      ? '/crm_front_react/'
      : '/crm_front_react/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{element}</>;
};

export default ProtectedRoute;
