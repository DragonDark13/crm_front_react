import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography} from '@mui/material';
import {ICustomerDetails} from "../../../../utils/types";
import CustomDialog from "../../CustomDialog/CustomDialog";
import CancelButton from "../../../Buttons/CancelButton";

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
                <Typography variant="body1"><strong>Електронна пошта:</strong> {customer.email || 'Немає даних'}
                </Typography>
                <Typography variant="body1"><strong>Телефон:</strong> {customer.phone_number || 'Немає даних'}
                </Typography>
                <Typography variant="body1"><strong>Адреса:</strong> {customer.address || 'Немає даних'}</Typography>

                {customer.sales && customer.sales.length > 0 ? (
                    <>
                        <Typography variant="h6" sx={{mt: 2}}>Історія покупок</Typography>
                        <ul>
                            {customer.sales.map(sale => (
                                <li key={sale.id} style={{marginBottom: 12}}>
                                    <Typography variant="body2">
                                        <strong>Товар:</strong> {sale.product?.name || '—'}<br/>
                                        <strong>Кількість:</strong> {sale.quantity_sold} шт.<br/>
                                        <strong>Ціна за одиницю:</strong> {sale.selling_price_per_item} ₴<br/>
                                        <strong>Дата продажу:</strong> {sale.sale_date}<br/>
                                        <strong>Постачальник:</strong> {sale.product?.supplier?.name || '—'}
                                    </Typography>

                                    {sale.packaging_material ? (
                                        <Typography variant="body2" sx={{mt: 1}}>
                                            <strong>Пакування:</strong> {sale.packaging_material.name}<br/>
                                            <strong>Кількість пакування:</strong> {sale.packaging_quantity}<br/>
                                            <strong>Загальна собівартість пакування:</strong> {sale.total_packaging_cost} ₴<br/>
                                            <strong>Постачальник пакування</strong> {sale.packaging_material.supplier.name}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" sx={{mt: 1}} color="text.secondary">
                                            Пакування не використовувалось
                                        </Typography>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <Typography variant="body1" sx={{mt: 2}}>
                        Клієнт не виконав покупок.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose}>Закрити</CancelButton>
            </DialogActions>
        </CustomDialog>
    );
};

export default CustomerDetailsDialog;
