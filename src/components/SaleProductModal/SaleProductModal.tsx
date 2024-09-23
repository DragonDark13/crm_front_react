import React from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const SaleProductModal = ({ open, handleClose, saleData, setSaleData, handleSale }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{ padding: 2, bgcolor: 'white', borderRadius: 2 }}>
                <h2 id="modal-title">Sale Product</h2>
                <TextField
                    label="Customer"
                    value={saleData.customer}
                    onChange={(e) => setSaleData({ ...saleData, customer: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Quantity"
                    type="number"
                    value={saleData.quantity}
                    onChange={(e) => {
                        const quantity = Number(e.target.value);
                        setSaleData({
                            ...saleData,
                            quantity,
                            total_price: (quantity * saleData.price_per_item)
                        });
                    }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Price per Item"
                    type="number"
                    value={saleData.price_per_item}
                    onChange={(e) => {
                        const price = Number(e.target.value);
                        setSaleData({
                            ...saleData,
                            price_per_item: price,
                            total_price: (price * saleData.quantity)
                        });
                    }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Total Price"
                    value={saleData.total_price}
                    InputProps={{
                        readOnly: true,
                    }}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Sale Date"
                    type="date"
                    value={saleData.sale_date}
                    onChange={(e) => setSaleData({ ...saleData, sale_date: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleSale} sx={{ mt: 2 }}>
                    Save Sale
                </Button>
            </Box>
        </Modal>
    );
};

export default SaleProductModal;
