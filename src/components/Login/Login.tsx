import React, {useState} from 'react';
import {TextField, Button, Box, Typography, Container} from '@mui/material';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {loginUser} from "../../api/_user";

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const {login} = useAuth();
    const navigate = useNavigate();
      const { showSnackbarMessage } = useSnackbarMessage();


    function isLocalStorageAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = await loginUser(username, password); // Викликаємо функцію для логіну
            if (isLocalStorageAvailable()) {
                localStorage.setItem('token', token); // Зберігаємо токен
            }
            login(token); // Встановлюємо токен в контекст
            showSnackbarMessage('Ви ввійшли в систему', 'success')
            navigate('/crm_front_react/'); // Перенаправляємо на захищену сторінку після логіну
        } catch (error) {
            setError('Invalid username or password');
            console.error('Login failed', error);
        }
    };

    return (
        <Container maxWidth="xs">
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
                <Typography variant="h5" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <Typography color="error" variant="body2" align="center" sx={{marginTop: 2}}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{marginTop: 2}}
                    >
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
