import React from 'react';
import {DialogContent, DialogActions, Button, Typography} from '@mui/material';
import CancelButton from "../../../Buttons/CancelButton";
import CustomDialog from "../../CustomDialog/CustomDialog";

interface ConfirmDeleteDialogProps {
    open: boolean;
    handleClose: () => void;
    record: any; // Типізуй по потребі
    type: 'purchase' | 'sale';
    onConfirm: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
                                                                     open,
                                                                     handleClose,
                                                                     record,
                                                                     type,
                                                                     onConfirm
                                                                 }) => {
    const isPurchase = type === 'purchase';

    return (
        <CustomDialog title={'Підтвердження видалення'} open={open} handleClose={handleClose}>
            <DialogContent>
                <Typography>
                    Ви дійсно хочете видалити запис <strong>{isPurchase ? 'закупівлі' : 'продажу'}</strong> товару від
                    {isPurchase && record?.supplier?.name ? (
                        <> постачальника <strong>{record.supplier.name}</strong></>
                    ) : null}
                    {' '}на
                    дату <strong>{new Date(record?.date || record?.purchase_date || '').toLocaleDateString()}</strong>,
                    кількість: <strong>{record?.quantity_purchase || record?.quantity_sold} шт</strong>,
                    сума: <strong>{record?.purchase_total_price || record?.total_sale_price} грн</strong>?
                </Typography>
            </DialogContent>
            <DialogActions>
                <CancelButton text={'Скасувати'} onClick={handleClose}/>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Видалити
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default ConfirmDeleteDialog;
