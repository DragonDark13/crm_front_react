import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button} from '@mui/material';
import axiosInstance from './axiosInstance'; // Ваш axios інстанс для запитів

interface UpdatePackagingModalProps {
    open: boolean;
    onClose: () => void;
}

const UpdatePackagingModal: React.FC<UpdatePackagingModalProps> = ({open, onClose}) => {
    const [quantity, setQuantity] = useState<number>(0); // Стейт для кількості
    const [status, setStatus] = useState<string>('available'); // Стейт для статусу

    const handleSubmit = async () => {
        try {
            // Запит на оновлення пакування
            await axiosInstance.post('/update_packaging', {
                quantity,
                status,
            });
            alert('Пакування оновлено успішно!');
            onClose(); // Закриваємо модальне вікно після успішного оновлення
        } catch (error) {
            console.error('Помилка при оновленні пакування:', error);
            alert('Помилка при оновленні пакування');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Оновити пакування</DialogTitle>
            <DialogContent>
                <TextField
                    label="Кількість"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    fullWidth
                    margin="dense"
                />
                <TextField
                    label="Статус"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Відмінити
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    Оновити
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdatePackagingModal;
