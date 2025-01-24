import React, {useState} from 'react';
import {Modal, Box, Typography, TextField, Button, Grid, Divider} from '@mui/material';
import {sellGiftSet} from "../../../api/api";

interface IGiftSetSaleModalProps {
    open: boolean;
    onClose: () => void;
    giftSet: any; // Модель даних набору
}

const GiftSetSaleModal: React.FC<IGiftSetSaleModalProps> = ({open, onClose, giftSet}) => {
    const [saleDate, setSaleDate] = useState<string>('');
    const [sellingPrice, setSellingPrice] = useState<number>(giftSet.gift_selling_price || 0);
    const [customer, setCustomer] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    const calculateTotalCost = () => {
        const packagingCost = giftSet.packagings.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
        );
        const productCost = giftSet.products.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
        );
        return packagingCost + productCost;
    };


    const handleSell = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await sellGiftSet(giftSet.id, customer);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{width: 600, margin: 'auto', padding: 4, background: 'white', mt: '10%'}}>
                <Typography variant="h6" gutterBottom>
                    Sell Gift Set
                </Typography>

                <Typography variant="subtitle1">
                    <strong>Name:</strong> {giftSet.name}
                </Typography>
                <Typography variant="body1">{giftSet.description}</Typography>

                <Divider sx={{my: 2}}/>

                <Typography variant="h6">Items</Typography>
                {giftSet.products.map((product: any, index: number) => (
                    <Grid container key={index} sx={{mb: 1}}>
                        <Grid item xs={6}>{product.name}</Grid>
                        <Grid item xs={3}>{product.price} UAH</Grid>
                        <Grid item xs={3}>Total: {(product.price * product.quantity).toFixed(2)} UAH</Grid>
                    </Grid>
                ))}

                {giftSet.packagings.map((packaging: any, index: number) => (
                    <Grid container key={index} sx={{mb: 1}}>
                        <Grid item xs={6}>{packaging.name}</Grid>
                        <Grid item xs={3}>{packaging.price} UAH</Grid>
                        <Grid item xs={3}>Total: {(packaging.price * packaging.quantity).toFixed(2)} UAH</Grid>
                    </Grid>
                ))}

                <Divider sx={{my: 2}}/>

                <Typography variant="h6">
                    Total Cost: {calculateTotalCost().toFixed(2)} UAH
                </Typography>

                <TextField
                    label="Sale Date"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    fullWidth
                    sx={{my: 2}}
                    InputLabelProps={{shrink: true}}
                />

                <TextField
                    label="Selling Price"
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value))}
                    fullWidth
                    sx={{my: 2}}
                />

                <TextField
                    label="Customer Name"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    fullWidth
                    sx={{my: 2}}
                />

                <Box display="flex" justifyContent="space-between">
                    <Button onClick={onClose} disabled={loading} sx={{mr: 1}}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSell}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Sell'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default GiftSetSaleModal;
