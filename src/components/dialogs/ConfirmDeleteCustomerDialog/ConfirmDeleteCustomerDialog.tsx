// src/components/dialogs/ConfirmDeleteDialog.tsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import CancelButton from "../../Buttons/CancelButton";

interface IConfirmDeleteCustomerDialog {
    open: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteCustomerDialog: React.FC<IConfirmDeleteCustomerDialog> = ({
    open,
    title = 'Підтвердження видалення',
    description = 'Ви впевнені, що хочете видалити цього покупця?',
    onConfirm,
    onCancel
}) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{description}</Typography>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onCancel} >
                    Скасувати
                </CancelButton>
                <Button onClick={onConfirm}  variant={"contained"}>
                    Видалити
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteCustomerDialog;
