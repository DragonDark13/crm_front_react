import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography} from '@mui/material';
import {ICustomerDetails} from "../../../utils/types";

interface CustomerDetailsDialogProps {
    open: boolean;
    customer: ICustomerDetails;
    handleClose: () => void;
}

const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({open, customer, handleClose}) => {
    if (!customer) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Деталі клієнта</DialogTitle>
            <DialogContent>
                <Typography variant="body1"><strong>Ім'я:</strong> {customer.name}</Typography>
                <Typography variant="body1"><strong>Електронна пошта:</strong> {customer.email}</Typography>
                <Typography variant="body1"><strong>Телефон:</strong> {customer.phone_number}</Typography>
                <Typography variant="body1"><strong>Адреса:</strong> {customer.address || 'Немає даних'}</Typography>

                {customer.sales && customer.sales.length > 0 ? (
                    <>
                        <Typography variant="h6" style={{marginTop: '20px'}}>Історія покупок</Typography>
                        <ul>
                            { customer.sales.map(sale => (
                                <li key={sale.id}>
                                    {sale.product} - {sale.quantity_sold} шт. за {sale.selling_price_per_item} ₴
                                </li>
                            ))}
                        </ul>
                    </>
                )
                    :
                <Typography variant="body1" style={{marginTop: '20px'}}>Клієнт не виконав покупок.</Typography>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Закрити
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerDetailsDialog;
