import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import {deleteAllPackagingMaterials} from "../../../../api/_packagingMaterials";

const DeleteAllMaterialsDialog: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDelete = async () => {
        try {
            await deleteAllPackagingMaterials();
            alert('Усі упаковочні матеріали та пов’язані записи успішно видалено.');
            handleClose();
        } catch (error) {
            console.error('Помилка під час видалення:', error);
            alert('Сталася помилка під час видалення.');
        }
    };

    return (
        <div>
            <Button variant="contained" color="error" onClick={handleClickOpen}>
                Видалити всі упаковочні матеріали
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Підтвердження видалення</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ви впевнені, що хочете видалити **усі упаковочні матеріали** та пов&apos;язані з ними дані? Цю дію
                        неможливо скасувати!
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

export default DeleteAllMaterialsDialog;
