import {  TextField, Button, DialogActions, DialogContent} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";

interface IPurchaseProductModal {
    open: boolean;
    handleClose: () => void;
    purchaseDetails: {
        price_per_item: number;
        total_price: number;
        supplier: string;
        purchase_date: string;
    };
    setPurchaseDetails: (details: {
        price_per_item: number;
        total_price: number;
        supplier: string;
        purchase_date: string;
    }) => void;
    handleSubmitPurchase: () => void;
}

const PurchaseProductModal = ({
                                  open,
                                  handleClose,
                                  purchaseDetails,
                                  setPurchaseDetails,
                                  handleSubmitPurchase
                              }: IPurchaseProductModal) => {
    return (
        <CustomDialog
            open={open}
            handleClose={handleClose}
            title="Purchase Product"
            maxWidth="xl"
        >
            <DialogContent>
                <TextField
                    label="Price per Item"
                    type="number"
                    value={purchaseDetails.price_per_item}
                    onChange={(e) => setPurchaseDetails({...purchaseDetails, price_per_item: Number(e.target.value)})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Total Price"
                    type="number"
                    value={purchaseDetails.total_price}
                    onChange={(e) => setPurchaseDetails({...purchaseDetails, total_price: Number(e.target.value)})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Supplier"
                    value={purchaseDetails.supplier}
                    onChange={(e) => setPurchaseDetails({...purchaseDetails, supplier: e.target.value})}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Purchase Date"
                    type="date"
                    value={purchaseDetails.purchase_date}
                    onChange={(e) => setPurchaseDetails({...purchaseDetails, purchase_date: e.target.value})}
                    fullWidth
                    margin="normal"
                />

            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleSubmitPurchase} sx={{mt: 2}}>
                    Confirm Purchase
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default PurchaseProductModal;
