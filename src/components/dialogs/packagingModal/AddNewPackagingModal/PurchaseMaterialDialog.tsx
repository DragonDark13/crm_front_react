import React, {useState} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField, Box, MenuItem, Grid,
} from '@mui/material';
import {axiosInstance} from "../../../../api/api";
import CustomDialog from "../../CustomDialog/CustomDialog";
import AddPackagingSupplierDialog from "../AddPackagingSupplierDialog/AddPackagingSupplierDialog";
import CancelButton from "../../../Buttons/CancelButton";
import AddButton from "../../../Buttons/AddButton";
import {IMaterialSupplier, PurchaseMaterialDialogProps} from "../../../../utils/types";
import SupplierSelect from "../../../FormComponents/SupplierSelect";
import QuantityField from "../../../FormComponents/QuantityField";
import PriceField from "../../../FormComponents/PriceField";
import {parseDecimalInput} from "../../../../utils/_validation";
import TotalPriceField from "../../../FormComponents/TotalPriceField";


const PurchaseMaterialDialog: React.FC<PurchaseMaterialDialogProps> = ({
                                                                           open,
                                                                           onClose,
                                                                           materialId,
                                                                           onPurchaseSuccess,
                                                                           defaultSupplierId,
                                                                           defaultPricePerUnit,
                                                                           materialName,
                                                                           isAuthenticated = false
                                                                       }) => {
    const [supplierId, setSupplierId] = useState<number | null>(defaultSupplierId || null);
    const [quantity, setQuantity] = useState<number>(1); // Замовчуванням 1
    const [pricePerUnit, setPricePerUnit] = useState<number>(defaultPricePerUnit || 0);
    const [totalPurchaseCost, setTotalPurchaseCost] = useState<number>(quantity * (defaultPricePerUnit || 0)); // Загальна вартість закупівлі
    const [addSupplierOpen, setAddSupplierOpen] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);


    // Функція для розрахунку загальної суми закупівлі
    const calculateTotalCost = (quantity: number, pricePerUnit: number) => {
        return quantity * pricePerUnit;
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axiosInstance.get("/get_all_packaging_suppliers");
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers", error);
        }
    };

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    // Викликається при зміні кількості
    const MIN_QUANTITY = 0;
    const MAX_QUANTITY = 1000;

// Обробка зміни вручну
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.startsWith('0')) {
            value = value.replace(/^0+/, '') || '0';
        }

        const newQuantity = Math.min(Math.max(Number(value), MIN_QUANTITY), MAX_QUANTITY);
        setQuantity(newQuantity);
        setTotalPurchaseCost(calculateTotalCost(newQuantity, pricePerUnit));
    };

// Кнопка +
    const handleIncrement = () => {
        if (quantity < MAX_QUANTITY) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            setTotalPurchaseCost(calculateTotalCost(newQuantity, pricePerUnit));
        }
    };

// Кнопка -
    const handleDecrement = () => {
        if (quantity > MIN_QUANTITY) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            setTotalPurchaseCost(calculateTotalCost(newQuantity, pricePerUnit));
        }
    };

    // Викликається при зміні ціни за одиницю
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = parseDecimalInput(e.target.value);
        if (parsed !== null) {
            setPricePerUnit(parsed);
            setTotalPurchaseCost(calculateTotalCost(quantity, parsed));
        }
    };

    const handlePurchase = async () => {
        if (quantity <= 0 || pricePerUnit <= 0) {
            alert('Будь ласка, заповніть всі поля правильно.');
            return;
        }

        try {
            const purchaseData = {
                material_id: materialId,
                supplier_id: supplierId,
                quantity,
                purchase_price_per_unit: pricePerUnit,
                total_purchase_cost: totalPurchaseCost, // Відправляємо загальну вартість
            };

            await axiosInstance.post('/purchase_current_packaging', purchaseData);
            alert('Закупівля успішно виконана');
            onPurchaseSuccess();
            onClose();
        } catch (error) {
            console.error('Error purchasing material:', error);
            alert('Помилка при закупівлі матеріалу.');
        }
    };

    const handleOpenAddSupplier = () => {
        setAddSupplierOpen(true);
    };

    const handleCloseAddSupplier = () => {
        setAddSupplierOpen(false);
    };

    return (
        <React.Fragment>
            <CustomDialog
                maxWidth={"sm"}
                open={open}
                handleClose={onClose}
                title={"Закупити " + materialName}
            >
                <DialogContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Вибір постачальника */}
                        <Grid item xs={12} sm={8} md={9}>
                            <SupplierSelect suppliers={suppliers} value={supplierId || ''}
                                            onChange={(e) => setSupplierId(Number(e.target.value))}/>

                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <AddButton sx={{marginTop: 1}} onClick={handleOpenAddSupplier}/>
                        </Grid>

                        {/* Кількість */}
                        <Grid item xs={12} sm={6} md={4}>
                            <QuantityField min={MIN_QUANTITY} value={quantity} onChange={handleQuantityChange}
                                           onIncrement={handleIncrement}
                                           onDecrement={handleDecrement}/>

                        </Grid>

                        {/* Ціна за одиницю */}
                        <Grid item xs={12} sm={6} md={4}>
                            <PriceField value={pricePerUnit} onChange={handlePriceChange} error={null}/>

                        </Grid>

                        {/* Загальна сума закупівлі */}
                        <Grid item xs={12} sm={12} md={4}>
                            <TotalPriceField value={totalPurchaseCost.toFixed(2)}/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={onClose}/>
                    <Button disabled={!isAuthenticated} onClick={handlePurchase} color="primary" variant="contained">
                        Закупити
                    </Button>
                </DialogActions>


            </CustomDialog>

            {/* Add Supplier Dialog */}
            {addSupplierOpen && (
                <AddPackagingSupplierDialog
                    isAuthenticated={isAuthenticated}
                    handleCloseAddSupplier={handleCloseAddSupplier}

                    openAddSupplier={addSupplierOpen}/>
            )}
        </React.Fragment>

    );
};

export default PurchaseMaterialDialog;
