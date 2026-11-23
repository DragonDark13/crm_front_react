import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {API_ENDPOINTS, getApiErrorMessage, postResource} from '../../api/api';
import {useAuth} from '../context/AuthContext';
import {useSnackbarMessage} from '../Provider/SnackbarMessageContext';

const CONFIRMATION_PHRASE = 'ОЧИСТИТИ БАЗУ';

const DatabaseSettingsPage: React.FC = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const {logout} = useAuth();
    const {showSnackbarMessage} = useSnackbarMessage();
    const navigate = useNavigate();

    const handleClose = () => {
        if (isResetting) return;
        setDialogOpen(false);
        setConfirmation('');
    };

    const handleReset = async () => {
        if (confirmation !== CONFIRMATION_PHRASE) return;

        setIsResetting(true);
        try {
            await postResource(API_ENDPOINTS.RESET_DATABASE, {confirmation: CONFIRMATION_PHRASE});
            showSnackbarMessage('Базу даних повністю очищено. Потрібно увійти знову.', 'success');
            await logout().catch(() => undefined);
            navigate('/crm_front_react/login', {replace: true});
        } catch (error) {
            showSnackbarMessage(getApiErrorMessage(error, 'Не вдалося очистити базу даних'), 'error');
            setIsResetting(false);
        }
    };

    return (
        <Box sx={{maxWidth: 760, mx: 'auto', mt: 4}}>
            <Typography className="crm-page-title" component="h1" variant="h4" gutterBottom>
                Налаштування бази даних
            </Typography>
            <Alert severity="warning" sx={{mb: 3}}>
                Повне скидання видаляє всі дані з бази, включно з товарами, закупівлями,
                продажами, фінансовими операціями, історією, журналами та обліковими записами.
                Операцію неможливо скасувати.
            </Alert>
            <Typography variant="body1" sx={{mb: 2}}>
                Після очищення системні ролі та облікові записи будуть створені повторно лише
                за наявності відповідних паролів у змінних середовища GUEST_PASSWORD і MANAGER_PASSWORD.
                Перед виконанням переконайся, що маєш актуальну резервну копію бази даних.
            </Typography>
            <Button
                variant="contained"
                color="error"
                onClick={() => setDialogOpen(true)}
            >
                Повне скидання бази даних
            </Button>

            <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Підтвердження повного скидання</DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{mb: 2}}>
                        Буде видалено всі записи, історичні дані та користувачів. Після операції
                        поточний сеанс завершиться. Відновити дані можна буде лише з резервної копії.
                    </Alert>
                    <Typography variant="body2" sx={{mb: 2}}>
                        Для підтвердження введи фразу: <strong>{CONFIRMATION_PHRASE}</strong>
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Підтвердження"
                        value={confirmation}
                        onChange={event => setConfirmation(event.target.value)}
                        disabled={isResetting}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isResetting}>
                        Скасувати
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReset}
                        disabled={confirmation !== CONFIRMATION_PHRASE || isResetting}
                    >
                        {isResetting ? 'Очищення...' : 'Видалити всі дані'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DatabaseSettingsPage;
