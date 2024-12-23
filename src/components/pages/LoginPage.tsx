// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useAuth } from '../components/context/AuthContext';

interface LoginPageProps {
  setUserRole: React.Dispatch<React.SetStateAction<string>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ setUserRole }) => {
  const [role, setRole] = useState('');

  const handleLogin = () => {
    setUserRole(role);
  };

  return (
    <div>
      <h2>Login</h2>
      <TextField
        label="Enter Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        variant="outlined"
      />
      <Button onClick={handleLogin} variant="contained">
        Login
      </Button>
    </div>
  );
};

export default LoginPage;
