import React, {useState} from 'react';
import CustomDialog from "../CustomDialog/CustomDialog";
import {
    Box,
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
import {axiosInstance} from "../../../api/api";
import AddPackagingSupplierForm from "./AddPackagingSupplierForm";

interface IAddNewPackaging {
    openAddNewPackaging: boolean;
    handleCloseAddNewPackaging: () => void;
    handleAddClick: () => void;
}

const AddNewPackagingModal = ({
                                  handleAddClick,
                                  handleCloseAddNewPackaging,
                                  openAddNewPackaging
                              }: IAddNewPackaging) => {

    const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);
    const [name, setName] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [quantityPurchased, setQuantityPurchased] = useState("");
    const [purchasePricePerUnit, setPurchasePricePerUnit] = useState("");
    const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);  // To store the total purchase cost
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [openAddSupplier, setOpenAddSupplier] = useState(false);

    // Fetch suppliers
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
        calculateTotalCost(value, purchasePricePerUnit); // Recalculate total cost when quantity changes
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPurchasePricePerUnit(value);
        calculateTotalCost(quantityPurchased, value); // Recalculate total cost when price changes
    };

    const calculateTotalCost = (quantity: string, pricePerUnit: string) => {
        if (quantity && pricePerUnit) {
            const totalCost = parseFloat(quantity) * parseFloat(pricePerUnit);
            setTotalPurchaseCost(totalCost);
        } else {
            setTotalPurchaseCost(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axiosInstance.post("/packaging_materials/purchase", {
                name,
                supplier_id: supplierId,
                quantity_purchased: parseFloat(quantityPurchased),
                purchase_price_per_unit: parseFloat(purchasePricePerUnit),
                total_purchase_cost: totalPurchaseCost,
            });
            console.log("Success:", response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddSupplier = () => {
        setOpenAddSupplier(true);
    };

    const handleCloseAddSupplier = async () => {
        setOpenAddSupplier(false);
        await fetchSuppliers(); // Update supplier list after adding a new supplier
    };

    return (
        <>
            <CustomDialog
                open={openAddNewPackaging}
                handleClose={handleCloseAddNewPackaging}
                title="Додайте нове пакування"
                maxWidth="md"
            >
                <DialogContent>
                    <Grid container spacing={2}>
                        <Box component="form" onSubmit={handleSubmit} sx={{maxWidth: 400, mx: "auto", mt: 4}}>
                            <Typography variant="h6" mb={2}>
                                Purchase Packaging Material
                            </Typography>
                            <TextField
                                label="Material Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                margin="normal"
                                required
                            />
                            <Box sx={{display: "flex", alignItems: "center", gap: 2}}>

                                <TextField
                                    select
                                    label="Supplier"
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
                                <Button variant="outlined" onClick={handleOpenAddSupplier}>
                                    Додати
                                </Button>
                            </Box>
                            <TextField
                                label="Quantity Purchased"
                                value={quantityPurchased}
                                onChange={handleQuantityChange}
                                type="number"
                                fullWidth
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Purchase Price Per Unit"
                                value={purchasePricePerUnit}
                                onChange={handlePriceChange}
                                type="number"
                                fullWidth
                                margin="normal"
                                required
                            />
                            {/* Total Purchase Cost */}
                            <TextField
                                label="Total Purchase Cost"
                                value={totalPurchaseCost.toFixed(2)}  // Format to 2 decimal places
                                fullWidth
                                margin="normal"
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                            {error && (
                                <Typography color="error" variant="body2" mb={2}>
                                    {error}
                                </Typography>
                            )}
                            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                                {loading ? <CircularProgress size={24}/> : "Submit"}
                            </Button>

                        </Box>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant={"outlined"} onClick={handleCloseAddNewPackaging}>Закрити</Button>
                    <Button variant="contained" color="primary" onClick={handleAddClick} disabled={isAddButtonDisabled}>
                        Придбати
                    </Button>
                </DialogActions>
            </CustomDialog>

            {/* Modal to Add New Supplier */}
            {openAddSupplier && (
                <CustomDialog
                    open={openAddSupplier}
                    handleClose={handleCloseAddSupplier}
                    title="Додати постачальника"
                >
                    <AddPackagingSupplierForm handleClose={handleCloseAddSupplier}/>
                </CustomDialog>
            )}
        </>
    );
};

export default AddNewPackagingModal;
