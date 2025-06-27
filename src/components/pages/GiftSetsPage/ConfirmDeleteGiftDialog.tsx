import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import CustomDialog from "../../dialogs/CustomDialog/CustomDialog";
import CancelButton from "../../Buttons/CancelButton";

type IConfirmDeleteGiftDialog = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName?: string;
};

const ConfirmDeleteGiftDialog: React.FC<IConfirmDeleteGiftDialog> = ({open, onClose, onConfirm, itemName}) => {
    return (
        <CustomDialog maxWidth={"xs"} title={'Підтвердження видалення'} handleClose={onClose} open={open}>
            <DialogContent>
                <Typography>Ви впевнені, що хочете видалити {itemName || 'цей запис'}?</Typography>
            </DialogContent>
            <DialogActions>
                <CancelButton text={"Скасувати"} onClick={onClose} />
                <Button onClick={onConfirm} color="error" variant="contained">Видалити</Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ConfirmDeleteGiftDialog;
