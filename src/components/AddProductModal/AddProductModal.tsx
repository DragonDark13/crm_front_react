import {
    TextField,
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    DialogContent,
    DialogActions,
    Grid, FormControl, Select, MenuItem, InputLabel
} from '@mui/material';
import {ICategory, INewProduct} from "../../App";
import CustomDialog from "../CustomDialog/CustomDialog";
import {useEffect, useState} from "react";
//TODO додай постачальників таблиці
// Повідомлення про успіх

interface IAddProductModal {
    open: boolean,
    handleCloseAdd: () => void,
    newProduct: INewProduct,
    setNewProduct: (product: INewProduct) => void,
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
    handleAdd: () => void
    suppliers: { id: number; name: string }[];  // Додано

}

const AddProductModal = ({
                             open,
                             handleCloseAdd,
                             newProduct,
                             setNewProduct,
                             categories,
                             selectedCategories,
                             handleCategoryChange,
                             handleAdd,
                             suppliers
                         }: IAddProductModal) => {
    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        quantity: '',
        price_per_item: ''
    });

    const validateFields = () => {
        const newErrors = {
            name: newProduct.name.trim() === '' ? 'Name is required' : '',
            supplier: newProduct.supplier_id === null ? 'Supplier is required' : '',
            quantity: newProduct.quantity < 0 ? 'Quantity must be greater than or equal to 0' : '',
            price_per_item: newProduct.price_per_item < 0 ? 'Price per item must be greater than or equal to 0' : ''
        };
        setErrors(newErrors);

        // Return true if there are no errors
        return Object.values(newErrors).every(error => error === '');
    };

    const handleAddClick = () => {
        if (validateFields()) {
            handleAdd();
        }
    };

    // Автоматичне оновлення total_price як добутку quantity і price_per_item
    useEffect(() => {
        const totalPrice = newProduct.quantity * newProduct.price_per_item;
        setNewProduct({...newProduct, total_price: totalPrice});
    }, [newProduct.quantity, newProduct.price_per_item]);

    return (
        <CustomDialog
            open={open}
            handleClose={handleCloseAdd}
            title="Додайте новий товар"
            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Назва товару"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            fullWidth
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name}
                            inputProps={{maxLength: 100}}  // Максимальна довжина 100 символів
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" error={!!errors.supplier}>
                            <InputLabel>Постачальник</InputLabel>
                            <Select
                                value={newProduct.supplier_id}  // Змінено для використання id постачальника
                                onChange={(e) => setNewProduct({...newProduct, supplier_id: e.target.value})}
                            >
                                {suppliers.map(supplier => (
                                    <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                                ))}
                            </Select>
                            {errors.supplier && <span className="error">{errors.supplier}</span>}
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Quantity"
                            type="number"
                            value={newProduct.quantity}
                            onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                            inputProps={{min: 0, max: 1000}}  // Обмеження значення від 0 до 1000
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={newProduct.price_per_item}
                            onChange={(e) => setNewProduct({...newProduct, price_per_item: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                            inputProps={{min: 0, max: 10000}}  // Обмеження значення від 0 до 10000
                            error={!!errors.price_per_item}
                            helperText={errors.price_per_item}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Total Price"
                            type="number"
                            value={newProduct.total_price}
                            fullWidth
                            margin="normal"
                            disabled  // Поле заблоковане для редагування
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
                <Button variant={"outlined"} onClick={handleCloseAdd}>Закрити</Button>
                <Button variant="contained" color="primary" onClick={handleAddClick} sx={{mt: 2}}>
                    Add Product
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddProductModal;
