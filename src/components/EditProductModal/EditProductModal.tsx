import React from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const EditProductModal = ({ open, handleClose, editProduct, setEditProduct, handleEditSave }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{ padding: 2, bgcolor: 'white', borderRadius: 2 }}>
                <h2 id="modal-title">Edit Product</h2>
                {editProduct && (
                    <div>
                        <TextField
                            label="Name"
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Supplier"
                            value={editProduct.supplier}
                            onChange={(e) => setEditProduct({ ...editProduct, supplier: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Quantity"
                            type="number"
                            value={editProduct.quantity}
                            onChange={(e) => setEditProduct({ ...editProduct, quantity: Number(e.target.value) })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Total Price"
                            type="number"
                            value={editProduct.total_price}
                            onChange={(e) => setEditProduct({ ...editProduct, total_price: Number(e.target.value) })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Price per Item"
                            type="number"
                            value={editProduct.price_per_item}
                            onChange={(e) => setEditProduct({ ...editProduct, price_per_item: Number(e.target.value) })}
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="primary" onClick={handleEditSave} sx={{ mt: 2 }}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </Box>
        </Modal>
    );
};

export default EditProductModal;
