import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography} from '@mui/material';
import {ICustomerDetails} from "../../../../utils/types";
import CustomDialog from "../../CustomDialog/CustomDialog";

interface CustomerDetailsDialogProps {
    open: boolean;
    customer: ICustomerDetails;
    handleClose: () => void;
}

const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({open, customer, handleClose}) => {
    if (!customer) return null;

    return (
        <CustomDialog
            open={open}
            title="Деталі клієнта"
            handleClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Typography variant="body1"><strong>Ім'я:</strong> {customer.name}</Typography>
                <Typography variant="body1"><strong>Електронна пошта:</strong> {customer.email}</Typography>
                <Typography variant="body1"><strong>Телефон:</strong> {customer.phone_number}</Typography>
                <Typography variant="body1"><strong>Адреса:</strong> {customer.address || 'Немає даних'}</Typography>

                {customer.sales && customer.sales.length > 0 ? (
                    <>
                        <Typography variant="h6" sx={{mt: 2}}>Історія покупок</Typography>
                        <ul>
                            {customer.sales.map(sale => (
                                <li key={sale.id}>
                                    {sale.product} - {sale.quantity_sold} шт. за {sale.selling_price_per_item} ₴
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <Typography variant="body1" sx={{mt: 2}}>Клієнт не виконав покупок.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Закрити
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CustomerDetailsDialog;
