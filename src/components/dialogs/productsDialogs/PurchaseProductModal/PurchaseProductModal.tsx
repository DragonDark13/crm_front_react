import {
    TextField,
    Button,
    DialogActions,
    DialogContent, Grid,
} from '@mui/material';
import CustomDialog from "../../CustomDialog/CustomDialog";
import {useState, useEffect} from "react";
import SupplierSelect from "../../../FormComponents/SupplierSelect";
import QuantityField from "../../../FormComponents/QuantityField";
import {roundToDecimalPlaces} from "../../../../utils/function";
import TotalPriceField from "../../../FormComponents/TotalPriceField";
import {IPurchaseData, ISupplierFull} from "../../../../utils/types";
import {useSuppliers} from "../../../Provider/SupplierContext";

interface IPurchaseProductModal {
    openPurchase: boolean;
    handleClosePurchase: () => void;
    purchaseDetails: IPurchaseData;
    setPurchaseDetails: (details: IPurchaseData) => void;
    handleSubmitPurchase: () => void;
    nameProduct: string
    isAuthenticated: boolean;
}

const PurchaseProductModal = ({
                                  openPurchase,
                                  handleClosePurchase,
                                  purchaseDetails,
                                  setPurchaseDetails,
                                  handleSubmitPurchase,
                                  nameProduct,
                                  isAuthenticated
                              }: IPurchaseProductModal) => {
    const [errors, setErrors] = useState({
        quantity: '',
        price_per_item: '',
        total_price: '',
        supplier: '',
        purchase_date: ''
    });

    const {suppliers} = useSuppliers()

    // Функція валідації полів
    const validateFields = () => {
        const newErrors = {
            quantity: purchaseDetails.quantity <= 0 ? 'Quantity must be greater than 0' : '',
            price_per_item: purchaseDetails.purchase_price_per_item <= 0 ? 'Price per item must be greater than 0' : '',
            total_price: purchaseDetails.purchase_total_price <= 0 ? 'Total price must be greater than 0' : '',
            supplier: purchaseDetails.supplier_id === '' ? 'Supplier is required' : '',
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
        const totalPrice = purchaseDetails.quantity * purchaseDetails.purchase_price_per_item;
        setPurchaseDetails({...purchaseDetails, purchase_total_price: roundToDecimalPlaces(totalPrice, 2)});
    }, [purchaseDetails.quantity, purchaseDetails.purchase_price_per_item]);

    const incrementQuantity = () => {
        if (purchaseDetails.quantity < 1000) {
            setPurchaseDetails({
                ...purchaseDetails,
                quantity: purchaseDetails.quantity + 1
            });
        }
    };

    const decrementQuantity = () => {
        if (purchaseDetails.quantity > 1) {
            setPurchaseDetails({
                ...purchaseDetails,
                quantity: purchaseDetails.quantity = 1
            });
        }
    };


    return (
        <CustomDialog
            open={openPurchase}
            handleClose={handleClosePurchase}
            title={`Закупити ${nameProduct} x ${purchaseDetails.quantity}шт`}
            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <SupplierSelect disabled={true}
                                        suppliers={suppliers}
                                        value={purchaseDetails.supplier_id}
                                        onChange={(e) => setPurchaseDetails({
                                            ...purchaseDetails,
                                            supplier_id: Number(e.target.value)
                                        })}/>


                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            size={"small"}
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

                        <QuantityField
                            onIncrement={incrementQuantity}
                            onDecrement={decrementQuantity}
                            value={purchaseDetails.quantity}
                            onChange={(e) => {
                                // Видаляємо ведучий 0, якщо такий є
                                let value = e.target.value;

                                value = value.replace(/[^0-9]/g, '');


                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                }
                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    setPurchaseDetails({...purchaseDetails, quantity: Number(e.target.value)})
                                }
                            }}

                            error={errors.quantity}
                        />


                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            size={"small"}
                            label="Ціна за 1шт"
                            type="number"
                            value={purchaseDetails.purchase_price_per_item}
                            onChange={(e) => setPurchaseDetails({
                                ...purchaseDetails,
                                purchase_price_per_item: Number(e.target.value)
                            })}
                            fullWidth
                            margin="normal"
                            error={!!errors.price_per_item}
                            helperText={errors.price_per_item}
                            inputProps={{min: 0, max: 100000}}  // Обмеження значення від 0 до 100000
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TotalPriceField value={purchaseDetails.purchase_total_price}/>
                    </Grid>

                </Grid>
            </DialogContent>

            <DialogActions>
                <Button variant={"outlined"} onClick={handleClosePurchase}>Закрити</Button>

                <Button variant="contained" color="primary" disabled={!isAuthenticated} onClick={handleSubmit}>
                    Підтвердити
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default PurchaseProductModal;
