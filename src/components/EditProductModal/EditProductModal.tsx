import React, {useState, useEffect} from 'react';
import {
    DialogContent,
    TextField,
    Button,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Grid
} from '@mui/material';
import {ICategory, IProduct} from "../../App";
import CustomDialog from "../CustomDialog/CustomDialog";

interface IEditProductModalProps {
    open: boolean;
    handleCloseEdit: () => void;
    editProduct: IProduct;
    setEditProduct: (product: IProduct) => void;
    handleEditSave: () => void;
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
}

const EditProductModal: React.FC<IEditProductModalProps> = ({
                                                                open,
                                                                handleCloseEdit,
                                                                editProduct,
                                                                setEditProduct,
                                                                handleEditSave,
                                                                categories,
                                                                selectedCategories,
                                                                handleCategoryChange,
                                                            }) => {
    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        quantity: '',
        price_per_item: ''
    });

    useEffect(() => {
        const totalPrice = editProduct.quantity * editProduct.price_per_item;
        setEditProduct({...editProduct, total_price: totalPrice});
    }, [editProduct.quantity, editProduct.price_per_item]);

    const validateFields = () => {
        let tempErrors = {name: '', supplier: '', quantity: '', price_per_item: ''};
        let isValid = true;

        if (!editProduct.name.trim()) {
            tempErrors.name = 'Name is required';
            isValid = false;
        } else if (editProduct.name.length > 100) {
            tempErrors.name = 'Name cannot exceed 100 characters';
            isValid = false;
        }

        if (!editProduct.supplier.trim()) {
            tempErrors.supplier = 'Supplier is required';
            isValid = false;
        } else if (editProduct.supplier.length > 100) {
            tempErrors.supplier = 'Supplier cannot exceed 100 characters';
            isValid = false;
        }

        if (editProduct.quantity < 0) {
            tempErrors.quantity = 'Quantity cannot be less than 0';
            isValid = false;
        } else if (editProduct.quantity > 100000) {
            tempErrors.quantity = 'Quantity cannot exceed 100,000';
            isValid = false;
        }

        if (editProduct.price_per_item < 0) {
            tempErrors.price_per_item = 'Price per item cannot be less than 0';
            isValid = false;
        } else if (editProduct.price_per_item > 100000) {
            tempErrors.price_per_item = 'Price per item cannot exceed 100,000';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSave = () => {
        if (validateFields()) {
            handleEditSave(); // Виклик збереження лише якщо всі поля валідні
        }
    };

    return (
        <CustomDialog
            open={open}
            handleClose={handleCloseEdit}
            title="Edit Product"
            maxWidth="xl"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Name"
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name}
                            inputProps={{ maxLength: 100 }}  // Максимальна довжина 100 символів
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Supplier"
                            value={editProduct.supplier}
                            onChange={(e) => setEditProduct({...editProduct, supplier: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.supplier}
                            helperText={errors.supplier}
                            inputProps={{ maxLength: 100 }}  // Максимальна довжина 100 символів
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={editProduct.quantity}
                            onChange={(e) => setEditProduct({...editProduct, quantity: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            inputProps={{ min: 0, max: 100000 }}  // Обмеження значення від 0 до 100000
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={editProduct.price_per_item}
                            onChange={(e) => setEditProduct({...editProduct, price_per_item: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                            error={!!errors.price_per_item}
                            helperText={errors.price_per_item}
                            inputProps={{ min: 0, max: 100000 }}  // Обмеження значення від 0 до 100000
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Total Price"
                            type="number"
                            value={editProduct.total_price}
                            fullWidth
                            margin="normal"
                            disabled
                        />
                    </Grid>
                </Grid>
                <FormGroup>
                    {categories.map(category => (
                        <FormControlLabel
                            key={category.id}
                            control={
                                <Checkbox
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                />
                            }
                            label={category.name}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button variant={"outlined"} onClick={handleCloseEdit}>Закрити</Button>
                <Button variant="contained" color="primary" onClick={handleSave} sx={{mt: 2}}>
                    Save Changes
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default EditProductModal;
