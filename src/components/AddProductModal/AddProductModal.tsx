import React from 'react';
import {
    Modal,
    Box,
    TextField,
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    IconButton, DialogContent
} from '@mui/material';
import {ICategory, IProduct} from "../../App";
import Transition from "../../styled/Transition";
import CloseIcon from "@mui/icons-material/Close";

interface IAddProductModal {
    open: boolean,
    handleClose: () => void,
    newProduct: IProduct,
    setNewProduct: (product: IProduct) => void,
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
    handleAdd: () => void
}

const AddProductModal = ({
                             open,
                             handleClose,
                             newProduct,
                             setNewProduct,
                             categories,
                             selectedCategories,
                             handleCategoryChange,
                             handleAdd
                         }: IAddProductModal) => {
    return (
        <Dialog
            TransitionComponent={Transition}
            keepMounted
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
             maxWidth={"xl"}
            fullWidth
        >
            <DialogTitle>Add New Product

                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Supplier"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Total Price"
                    type="number"
                    value={newProduct.total_price}
                    onChange={(e) => setNewProduct({...newProduct, total_price: Number(e.target.value)})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Price per Item"
                    type="number"
                    value={newProduct.price_per_item}
                    onChange={(e) => setNewProduct({...newProduct, price_per_item: Number(e.target.value)})}
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
                <Button variant="contained" color="primary" onClick={handleAdd} sx={{mt: 2}}>
                    Add Product
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductModal;
