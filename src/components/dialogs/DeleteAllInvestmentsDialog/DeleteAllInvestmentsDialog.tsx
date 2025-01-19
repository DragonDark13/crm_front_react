import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import axios from 'axios';
import {axiosInstance} from "../../../api/api";

const DeleteAllInvestmentsDialog: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.delete('/delete_all_investments'); // Запит до API
            alert(response.data.message);
            handleClose();
        } catch (error: any) {
            console.error('Помилка під час видалення:', error);
            alert(error.response?.data?.error || 'Сталася помилка під час видалення.');
        }
    };

    return (
        <div>
            <Button variant="contained" color="error" onClick={handleClickOpen}>
                Видалити всі інвестиції
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Підтвердження видалення</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ви впевнені, що хочете видалити **усі інвестиції**? Цю дію неможливо скасувати!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Скасувати
                    </Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DeleteAllInvestmentsDialog;
