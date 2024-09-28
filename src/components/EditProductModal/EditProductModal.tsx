import React from 'react';
import {DialogContent, TextField, Button, DialogActions, FormGroup, FormControlLabel, Checkbox} from '@mui/material';
import {ICategory, IProduct} from "../../App";
import CustomDialog from "../CustomDialog/CustomDialog";

interface IEditProductModalProps {
    open: boolean;
    handleClose: () => void;
    editProduct: IProduct;
    setEditProduct: (product: IProduct) => void;
    handleEditSave: () => void;
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
}

const EditProductModal: React.FC<IEditProductModalProps> = ({
                                                                open,
                                                                handleClose,
                                                                editProduct,
                                                                setEditProduct,
                                                                handleEditSave,
                                                                categories,
                                                                selectedCategories,
                                                                handleCategoryChange,
                                                            }) => {
    return (
        <CustomDialog
            open={open}
            handleClose={handleClose}
            title="Edit Product"
            maxWidth="xl"
        >
            <DialogContent>
                        <TextField
                            label="Name"
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Supplier"
                            value={editProduct.supplier}
                            onChange={(e) => setEditProduct({...editProduct, supplier: e.target.value})}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            value={editProduct.quantity}
                            onChange={(e) => setEditProduct({...editProduct, quantity: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Total Price"
                            type="number"
                            value={editProduct.total_price}
                            onChange={(e) => setEditProduct({...editProduct, total_price: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={editProduct.price_per_item}
                            onChange={(e) => setEditProduct({...editProduct, price_per_item: Number(e.target.value)})}
                            fullWidth
                            margin="normal"
                        />
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
                                <Button variant={"outlined"} onClick={"handleClose"}>Закрити</Button>

                <Button variant="contained" color="primary" onClick={handleEditSave} sx={{mt: 2}}>
                    Save Changes
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default EditProductModal;
