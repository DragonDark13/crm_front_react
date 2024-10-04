import {TextField, Button, DialogContent, DialogActions, Grid} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import {useEffect, useState} from "react";
import QuantityField from "../FormComponents/QuantityField";
import {roundToDecimalPlaces} from "../../utils/function";
import TotalPriceField from "../FormComponents/TotalPriceField";
import {ISaleData} from "../../utils/types";

interface ISaleProductModal {
    openSale: boolean;
    handleCloseSale: () => void;
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    handleSale: () => void;
    nameProduct: string;
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

    useEffect(() => {
        const totalPrice = saleData.quantity * saleData.price_per_item;
        setSaleData({...saleData, total_price: roundToDecimalPlaces(totalPrice, 2)});
    }, [saleData.quantity, saleData.price_per_item]);

    const incrementQuantity = () => {
        if (saleData.quantity < 1000) {
            setSaleData({
                ...saleData,
                quantity: saleData.quantity + 1
            });
        }
    };

    const decrementQuantity = () => {
        if (saleData.quantity > 1) {
            setSaleData({
                ...saleData,
                quantity: saleData.quantity - 1 // Виправлено на зменшення значення
            });
        }
    };

    const isSubmitDisabled = () => {
        return (
            saleData.customer.trim() === '' ||
            saleData.price_per_item <= 0 ||
            saleData.quantity <= 0
        );
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
                            label="Дата продажу"
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
                        <QuantityField
                            onIncrement={incrementQuantity}
                            onDecrement={decrementQuantity}
                            value={saleData.quantity}
                            onChange={(e) => {
                                let value = e.target.value;
                                value = value.replace(/[^0-9]/g, '');

                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                }

                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    setSaleData({...saleData, quantity: Number(value)});
                                }
                            }}
                            error={errors.quantity}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Ціна за 1шт"
                            type="number"
                            value={saleData.price_per_item}
                            onChange={(e) => {
                                const pricePerItem = Number(e.target.value);
                                setSaleData({
                                    ...saleData,
                                    price_per_item: pricePerItem,
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
                        <TotalPriceField value={saleData.total_price}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseSale} color="primary">
                    Відміна
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled()} // Додаємо перевірку для активності кнопки
                >
                    Підтвердити продаж
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default SaleProductModal;
