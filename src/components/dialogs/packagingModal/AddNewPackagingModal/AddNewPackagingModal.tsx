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
import {axiosInstance} from "../../../../api/api";
import AddPackagingSupplierDialog from "../AddPackagingSupplierDialog/AddPackagingSupplierDialog";
import CancelButton from "../../../Buttons/CancelButton";
import AddIcon from "@mui/icons-material/Add";
import ProductNameField from "../../../FormComponents/ProductNameField";
import SupplierSelect from "../../../FormComponents/SupplierSelect";
import {parseDecimalInput} from "../../../../utils/_validation";
import AddButton from "../../../Buttons/AddButton";
import QuantityField from "../../../FormComponents/QuantityField";
import {handleDecrementGlobal, handleIncrementGlobal} from "../../../../utils/function";
import PriceField from "../../../FormComponents/PriceField";
import TotalPriceField from "../../../FormComponents/TotalPriceField";

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
    const [supplierId, setSupplierId] = useState<number | ''>("");
    const [quantityPurchased, setQuantityPurchased] = useState(1);
    const [purchasePricePerUnit, setPurchasePricePerUnit] = useState("");
    const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [openAddSupplier, setOpenAddSupplier] = useState(false);


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

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const value = e.target.value;
        const parsed = parseDecimalInput(e.target.value);
        if (parsed !== null) {
            setQuantityPurchased(parsed);
            calculateTotalCost(parsed, purchasePricePerUnit)
        }
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPurchasePricePerUnit(value);
        calculateTotalCost(quantityPurchased, value);
    };

    const calculateTotalCost = (quantity: number, pricePerUnit: string) => {
        if (quantity && pricePerUnit) {
            const totalCost = quantity * parseFloat(pricePerUnit);
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
                maxWidth="sm"
            >
                <DialogContent>
                    <Grid container spacing={1} alignItems={"center"}>
                        <Grid item xs={12} md={12}>
                            <ProductNameField label={"Назва матеріалу"} value={name}
                                              onChange={(e) => setName(e.target.value)} error={null}/>

                            {/*<TextField*/}
                            {/*    label="Назва матеріалу"*/}
                            {/*    value={name}*/}
                            {/*    onChange={(e) => setName(e.target.value)}*/}
                            {/*    fullWidth*/}
                            {/*    margin="normal"*/}
                            {/*    required*/}
                            {/*/>*/}
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <SupplierSelect suppliers={suppliers} value={supplierId}
                                            onChange={(e) => {

                                                setSupplierId(Number(e.target.value))

                                            }
                                            }/>
                            {/*<TextField*/}
                            {/*    select*/}
                            {/*    label="Постачальник"*/}
                            {/*    value={supplierId}*/}
                            {/*    onChange={(e) => setSupplierId(e.target.value)}*/}
                            {/*    fullWidth*/}
                            {/*    margin="normal"*/}
                            {/*    required*/}
                            {/*>*/}
                            {/*    {suppliers.map((supplier) => (*/}
                            {/*        <MenuItem key={supplier.id} value={supplier.id}>*/}
                            {/*            {supplier.name}*/}
                            {/*        </MenuItem>*/}
                            {/*    ))}*/}
                            {/*</TextField>*/}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <AddButton sx={{marginTop:1}} onClick={handleOpenAddSupplier}/>
                        </Grid>
                        <Grid item xs={12} sm={3} md={4}>
                            <QuantityField
                                min={1}
                                label={"Кількість придбаного"}
                                value={quantityPurchased}
                                onChange={handleQuantityChange}
                                onIncrement={() =>
                                    handleIncrementGlobal(quantityPurchased, 1000, setQuantityPurchased)
                                }
                                onDecrement={() =>
                                    handleDecrementGlobal(quantityPurchased, setQuantityPurchased)
                                }
                            />

                            {/*<TextField*/}
                            {/*    label="Кількість придбаного"*/}
                            {/*    value={quantityPurchased}*/}
                            {/*    onChange={handleQuantityChange}*/}
                            {/*    type="number"*/}
                            {/*    fullWidth*/}
                            {/*    margin="normal"*/}
                            {/*    required*/}
                            {/*/>*/}
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <PriceField label={'Ціна за одиницю'} value={purchasePricePerUnit}
                                        onChange={handlePriceChange}/>
                            {/*<TextField*/}
                            {/*    label="Ціна за одиницю"*/}
                            {/*    value={purchasePricePerUnit}*/}
                            {/*    onChange={handlePriceChange}*/}
                            {/*    type="number"*/}
                            {/*    fullWidth*/}
                            {/*    margin="normal"*/}
                            {/*    required*/}
                            {/*/>*/}
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TotalPriceField label={"Загальна вартість покупки"} value={totalPurchaseCost.toFixed(2)}/>
                            {/*<TextField*/}
                            {/*    label="Загальна вартість покупки"*/}
                            {/*    value={totalPurchaseCost.toFixed(2)}*/}
                            {/*    fullWidth*/}
                            {/*    margin="normal"*/}
                            {/*    InputProps={{readOnly: true}}*/}
                            {/*/>*/}
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
                    <CancelButton onClick={handleCloseAddNewPackaging}/>
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
