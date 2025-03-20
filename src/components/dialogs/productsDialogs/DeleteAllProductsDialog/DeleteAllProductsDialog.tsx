import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import axios from 'axios';
import {axiosInstance} from "../../../../api/api";

const DeleteAllProductsDialog: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDelete = async () => {
        try {
            await axiosInstance.delete('/delete_all_products'); // Запит на бекенд
            alert('Усі товари та пов’язані записи успішно видалено.');
            handleClose();
        } catch (error) {
            console.error('Помилка під час видалення:', error);
            alert('Сталася помилка під час видалення.');
        }
    };

    return (
        <div>
            <Button variant="contained" color="error" onClick={handleClickOpen}>
                Видалити всі продукти
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Підтвердження видалення</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ви впевнені, що хочете видалити **усі продукти** та пов'язані з ними дані? Цю дію неможливо
                        скасувати!
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

export default DeleteAllProductsDialog;
