import React, {useEffect, useState} from 'react';
import CustomDialog from "../../CustomDialog/CustomDialog";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import axios from "axios";
import {axiosInstance} from "../../../../api/api";
import AddPackagingSupplierForm from "./AddPackagingSupplierForm";
import AddPackagingSupplierDialog from "../AddPackagingSupplierDialog/AddPackagingSupplierDialog";
import CancelButton from "../../../Buttons/CancelButton";
import AddIcon from "@mui/icons-material/Add";

interface IAddNewPackaging {
    openAddNewPackaging: boolean;
    handleCloseAddNewPackaging: () => void;
    handlePurchaseNewPackaging: (IPurchasePackagingMaterial) => void;
}

const AddNewPackagingModal = ({
                                  handlePurchaseNewPackaging,
                                  handleCloseAddNewPackaging,
                                  openAddNewPackaging
                              }: IAddNewPackaging) => {

    const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);
    const [name, setName] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [quantityPurchased, setQuantityPurchased] = useState("");
    const [purchasePricePerUnit, setPurchasePricePerUnit] = useState("");
    const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [openAddSupplier, setOpenAddSupplier] = useState(false);

    React.useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await axiosInstance.get("/get_all_packaging_suppliers");
            setSuppliers(response.data);
        } catch (error) {
            console.error("Error fetching suppliers", error);
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuantityPurchased(value);
        calculateTotalCost(value, purchasePricePerUnit);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPurchasePricePerUnit(value);
        calculateTotalCost(quantityPurchased, value);
    };

    const calculateTotalCost = (quantity: string, pricePerUnit: string) => {
        if (quantity && pricePerUnit) {
            const totalCost = parseFloat(quantity) * parseFloat(pricePerUnit);
            setTotalPurchaseCost(totalCost);
        } else {
            setTotalPurchaseCost(0);
        }
    };


    const handleOpenAddSupplier = () => {
        setOpenAddSupplier(true);
    };

    const handleCloseAddSupplier = async () => {
        setOpenAddSupplier(false);
        await fetchSuppliers();
    };

    useEffect(() => {
        setIsAddButtonDisabled(!(name && supplierId && quantityPurchased && purchasePricePerUnit));
    }, [name, supplierId, quantityPurchased, purchasePricePerUnit]);

    return (
        <>
            <CustomDialog
                open={openAddNewPackaging}
                handleClose={handleCloseAddNewPackaging}
                title="Додайте нове пакування"
                maxWidth="md"
            >
                <DialogContent>
                    <Grid container spacing={2} alignItems={"center"}>
                        <Grid item xs={12} md={5}>
                            <TextField
                                label="Назва матеріалу"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                select
                                label="Постачальник"
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
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
                        <Grid item xs={12} sm={6} md={2}>
                            <Button size={"large"} color={"secondary"} variant={"contained"} onClick={handleOpenAddSupplier} endIcon={<AddIcon/>} >
                                Додати
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={3} md={4}>
                            <TextField
                                label="Кількість придбаного"
                                value={quantityPurchased}
                                onChange={handleQuantityChange}
                                type="number"
                                fullWidth
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Ціна за одиницю"
                                value={purchasePricePerUnit}
                                onChange={handlePriceChange}
                                type="number"
                                fullWidth
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Загальна вартість покупки"
                                value={totalPurchaseCost.toFixed(2)}
                                fullWidth
                                margin="normal"
                                InputProps={{readOnly: true}}
                            />
                        </Grid>
                        {error && (
                            <Grid item xs={12}>
                                <Typography color="error" variant="body2" mb={2}>
                                    {error}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={handleCloseAddNewPackaging} />
                    <Button variant="contained" color="primary"
                            onClick={() => handlePurchaseNewPackaging({
                                name: name,
                                supplier_id: supplierId,
                                quantity_purchased: quantityPurchased,
                                purchase_price_per_unit: purchasePricePerUnit,
                                total_purchase_cost: totalPurchaseCost
                            })}

                            disabled={isAddButtonDisabled || loading}>
                        {loading ? <CircularProgress size={24}/> : "Придбати"}
                    </Button>
                </DialogActions>
            </CustomDialog>

            {openAddSupplier && (
                <AddPackagingSupplierDialog handleCloseAddSupplier={handleCloseAddSupplier}
                                            openAddSupplier={openAddSupplier}/>
            )}
        </>
    );
};

export default AddNewPackagingModal;
