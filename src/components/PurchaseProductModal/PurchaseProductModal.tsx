import React from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const PurchaseProductModal = ({ open, handleClose, purchaseDetails, setPurchaseDetails, handleSubmitPurchase }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{ padding: 2, bgcolor: 'white', borderRadius: 2 }}>
                <h2 id="modal-title">Purchase Product</h2>
                <TextField
                    label="Price per Item"
                    type="number"
                    value={purchaseDetails.price_per_item}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, price_per_item: Number(e.target.value) })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Total Price"
                    type="number"
                    value={purchaseDetails.total_price}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, total_price: Number(e.target.value) })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Supplier"
                    value={purchaseDetails.supplier}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, supplier: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Purchase Date"
                    type="date"
                    value={purchaseDetails.purchase_date}
                    onChange={(e) => setPurchaseDetails({ ...purchaseDetails, purchase_date: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleSubmitPurchase} sx={{ mt: 2 }}>
                    Confirm Purchase
                </Button>
            </Box>
        </Modal>
    );
};

export default PurchaseProductModal;
