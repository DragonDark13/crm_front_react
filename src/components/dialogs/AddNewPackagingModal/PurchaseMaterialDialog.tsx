import React, {useState} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField, Box, MenuItem, Grid,
} from '@mui/material';
import {axiosInstance} from "../../../api/api";
import CustomDialog from "../CustomDialog/CustomDialog";
import AddPackagingSupplierDialog from "../AddPackagingSupplierDialog/AddPackagingSupplierDialog";

interface PurchaseMaterialDialogProps {
    open: boolean;
    onClose: () => void;
    materialId: number;
    onPurchaseSuccess: () => void;
}

const PurchaseMaterialDialog: React.FC<PurchaseMaterialDialogProps> = ({
                                                                           open,
                                                                           onClose,
                                                                           materialId,
                                                                           onPurchaseSuccess,
                                                                           defaultSupplierId,
                                                                           defaultPricePerUnit,
                                                                           suppliers,
                                                                       }) => {
    const [supplierId, setSupplierId] = useState<number | null>(defaultSupplierId || null);
    const [quantity, setQuantity] = useState<number>(1); // Замовчуванням 1
    const [pricePerUnit, setPricePerUnit] = useState<number>(defaultPricePerUnit || 0);
    const [totalPurchaseCost, setTotalPurchaseCost] = useState<number>(0); // Загальна вартість закупівлі
    const [addSupplierOpen, setAddSupplierOpen] = useState(false);

    // Функція для розрахунку загальної суми закупівлі
    const calculateTotalCost = (quantity: number, pricePerUnit: number) => {
        return quantity * pricePerUnit;
    };

    // Викликається при зміні кількості
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Number(e.target.value);
        setQuantity(newQuantity);
        setTotalPurchaseCost(calculateTotalCost(newQuantity, pricePerUnit));
    };

    // Викликається при зміні ціни за одиницю
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = Number(e.target.value);
        setPricePerUnit(newPrice);
        setTotalPurchaseCost(calculateTotalCost(quantity, newPrice));
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
                title="Закупити пакувальний матеріал"
            ><DialogContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Вибір постачальника */}
                    <Grid item xs={12} sm={8} md={9}>
                        <TextField
                            select
                            label="Постачальник"
                            value={supplierId || ''}
                            onChange={(e) => setSupplierId(Number(e.target.value))}
                            fullWidth
                            margin="normal"
                            required
                        >
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <Button variant="outlined" onClick={handleOpenAddSupplier} fullWidth>
                            Додати
                        </Button>
                    </Grid>

                    {/* Кількість */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Кількість"
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            fullWidth
                            margin="dense"
                        />
                    </Grid>

                    {/* Ціна за одиницю */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Ціна за одиницю"
                            type="number"
                            value={pricePerUnit}
                            onChange={handlePriceChange}
                            fullWidth
                            margin="dense"
                        />
                    </Grid>

                    {/* Загальна сума закупівлі */}
                    <Grid item xs={12} sm={12}  md={4}>
                        <TextField
                            label="Загальна сума закупівлі"
                            value={totalPurchaseCost.toFixed(2)} // Форматуємо до 2 знаків після коми
                            fullWidth
                            margin="dense"
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary">
                        Відмінити
                    </Button>
                    <Button onClick={handlePurchase} color="primary" variant="contained">
                        Закупити
                    </Button>
                </DialogActions>


            </CustomDialog>

            {/* Add Supplier Dialog */}
            {addSupplierOpen && (
                <AddPackagingSupplierDialog handleCloseAddSupplier={handleCloseAddSupplier}

                                            openAddSupplier={addSupplierOpen}/>
            )}
        </React.Fragment>

    );
};

export default PurchaseMaterialDialog;
