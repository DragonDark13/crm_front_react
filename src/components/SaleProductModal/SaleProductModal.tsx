import {TextField, Button, DialogContent, DialogActions, Grid} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import {ISaleData} from "../../App";
import {useState} from "react";

interface ISaleProductModal {
    openSale: boolean;
    handleCloseSale: () => void;
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    handleSale: () => void;
    nameProduct: string
}

const SaleProductModal = ({
                              openSale,
                              handleCloseSale,
                              saleData,
                              setSaleData,
                              handleSale,
                              nameProduct
                          }: ISaleProductModal) => {
    const [errors, setErrors] = useState({
        customer: '',
        sale_date: '',
        price_per_item: '',
        quantity: '',
    });

    // Валідація полів
    const validateFields = () => {
        const newErrors = {
            customer: saleData.customer.trim() === '' ? 'Customer name is required' : '',
            sale_date: saleData.sale_date === '' ? 'Sale date is required' : '',
            price_per_item: saleData.price_per_item <= 0 ? 'Price per item must be greater than 0' : '',
            quantity: saleData.quantity <= 0 ? 'Quantity must be greater than 0' : '',
        };

        setErrors(newErrors);

        // Перевірка, чи всі поля валідні (без помилок)
        return Object.values(newErrors).every(error => error === '');
    };

    // Обробник сабміту з валідацією
    const handleSubmit = () => {
        if (validateFields()) {
            handleSale();
        }
    };

    return (
        <CustomDialog
            open={openSale}
            handleClose={handleCloseSale}
            title={`Продаж ${nameProduct} x ${saleData.quantity}шт`}

            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Покупець"
                            value={saleData.customer}
                            onChange={(e) => setSaleData({...saleData, customer: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.customer}
                            helperText={errors.customer}
                            inputProps={{maxLength: 100}}  // Обмеження на довжину тексту
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Sale Date"
                            type="date"
                            value={saleData.sale_date}
                            onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.sale_date}
                            helperText={errors.sale_date}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={saleData.price_per_item}
                            onChange={(e) => {
                                const price = Number(e.target.value);
                                setSaleData({
                                    ...saleData,
                                    price_per_item: price,
                                    total_price: (price * saleData.quantity)
                                });
                            }}
                            fullWidth
                            margin="normal"
                            error={!!errors.price_per_item}
                            helperText={errors.price_per_item}
                            inputProps={{min: 1, max: 100000}}  // Обмеження значень
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={saleData.quantity}
                            onChange={(e) => {
                                const quantity = Number(e.target.value);
                                setSaleData({
                                    ...saleData,
                                    quantity,
                                    total_price: (quantity * saleData.price_per_item)
                                });
                            }}
                            fullWidth
                            margin="normal"
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            inputProps={{min: 1, max: 10000}}  // Обмеження кількості
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            disabled
                            label="Total Price"
                            value={saleData.total_price}
                            InputProps={{
                                readOnly: true,
                            }}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseSale} color="primary">
                    Відміна
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Підтвердити продаж
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default SaleProductModal;
