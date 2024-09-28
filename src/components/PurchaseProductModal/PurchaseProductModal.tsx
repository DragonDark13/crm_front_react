import {TextField, Button, DialogActions, DialogContent, Grid} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import  {useState, useEffect} from "react";
import {IPurchaseData} from "../../App";

interface IPurchaseProductModal {
    open: boolean;
    handleClosePurchase: () => void;
    purchaseDetails: IPurchaseData;
    setPurchaseDetails: (details: IPurchaseData) => void;
    handleSubmitPurchase: () => void;
}

const PurchaseProductModal = ({
                                  open,
                                  handleClosePurchase,
                                  purchaseDetails,
                                  setPurchaseDetails,
                                  handleSubmitPurchase
                              }: IPurchaseProductModal) => {
    const [errors, setErrors] = useState({
        quantity: '',
        price_per_item: '',
        total_price: '',
        supplier: '',
        purchase_date: ''
    });

    // Функція валідації полів
    const validateFields = () => {
        const newErrors = {
            quantity: purchaseDetails.quantity <= 0 ? 'Quantity must be greater than 0' : '',
            price_per_item: purchaseDetails.price_per_item <= 0 ? 'Price per item must be greater than 0' : '',
            total_price: purchaseDetails.total_price <= 0 ? 'Total price must be greater than 0' : '',
            supplier: purchaseDetails.supplier.trim() === '' ? 'Supplier is required' : '',
            purchase_date: purchaseDetails.purchase_date === '' ? 'Purchase date is required' : ''
        };
        setErrors(newErrors);

        // Перевірка, чи всі поля валідні (без помилок)
        return Object.values(newErrors).every(error => error === '');
    };

    // Обробник сабміту з валідацією
    const handleSubmit = () => {
        if (validateFields()) {
            handleSubmitPurchase();
        }
    };

    // Автоматичний розрахунок total_price
    useEffect(() => {
        const totalPrice = purchaseDetails.quantity * purchaseDetails.price_per_item;
        setPurchaseDetails({...purchaseDetails, total_price: totalPrice});
    }, [purchaseDetails.quantity, purchaseDetails.price_per_item]);

    return (
        <CustomDialog
            open={open}
            handleClose={handleClosePurchase}
            title="Purchase Product"
            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Supplier"
                            value={purchaseDetails.supplier}
                            onChange={(e) => setPurchaseDetails({...purchaseDetails, supplier: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.supplier}
                            helperText={errors.supplier}
                            inputProps={{maxLength: 100}}  // Обмеження на довжину тексту
                        />

                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Purchase Date"
                            type="date"
                            value={purchaseDetails.purchase_date}
                            onChange={(e) => setPurchaseDetails({...purchaseDetails, purchase_date: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.purchase_date}
                            helperText={errors.purchase_date}
                        />


                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={purchaseDetails.quantity}
                            onChange={(e) => setPurchaseDetails({...purchaseDetails, quantity: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            inputProps={{min: 0, max: 100000}}  // Обмеження значення від 0 до 100000
                        />

                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={purchaseDetails.price_per_item}
                            onChange={(e) => setPurchaseDetails({
                                ...purchaseDetails,
                                price_per_item: Number(e.target.value)
                            })}
                            fullWidth
                            margin="normal"
                            error={!!errors.price_per_item}
                            helperText={errors.price_per_item}
                            inputProps={{min: 0, max: 100000}}  // Обмеження значення від 0 до 100000
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Total Price"
                            type="number"
                            value={purchaseDetails.total_price}
                            fullWidth
                            margin="normal"
                            error={!!errors.total_price}
                            helperText={errors.total_price}
                            disabled // Поле заблоковане для редагування
                        />
                    </Grid>

                </Grid>
            </DialogContent>

            <DialogActions>
                <Button variant={"outlined"} onClick={handleClosePurchase}>Закрити</Button>

                <Button variant="contained" color="primary" onClick={handleSubmit} sx={{mt: 2}}>
                    Confirm Purchase
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default PurchaseProductModal;
