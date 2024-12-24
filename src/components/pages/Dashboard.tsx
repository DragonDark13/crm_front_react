// src/pages/Dashboard.tsx
import React from 'react';
import {Box, Typography, Container, Button} from '@mui/material';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';

const Dashboard: React.FC = () => {
    const {token, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/crm_front_react/login'); // Після виходу з системи, перенаправляє на сторінку логіну
    };

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 3,
                    marginTop: 8,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Welcome to the Dashboard
                </Typography>

                <Typography variant="body1" align="center" sx={{marginBottom: 2}}>
                    You are successfully logged in!
                </Typography>

                <Typography variant="body2" align="center" sx={{marginBottom: 4}}>
                    Token: {token ? 'Valid Token' : 'No Token'}
                </Typography>

                <Button variant="contained" color="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard;
