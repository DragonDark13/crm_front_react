import React from 'react';
import {Dialog, DialogTitle, DialogContent, TextField, Button, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Transition from "../../styled/Transition";
import {IProduct} from "../../App";

interface IEditProductModalProps {
    open: boolean;
    handleClose: () => void;
    editProduct: IProduct;
    setEditProduct: (product: IProduct) => void;
    handleEditSave: () => void;
}

const EditProductModal: React.FC<IEditProductModalProps> = ({
                                                                open,
                                                                handleClose,
                                                                editProduct,
                                                                setEditProduct,
                                                                handleEditSave,
                                                            }) => {
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
            <DialogTitle id="modal-title">
                Edit Product
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500]}}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {editProduct && (
                    <div>
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
                        <Button variant="contained" color="primary" onClick={handleEditSave} sx={{mt: 2}}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditProductModal;
