import {TextField, Button, DialogContent, DialogActions} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import {ISaleData} from "../../App";

// interface ISaleData {
//     customer: string;
//     quantity: number;
//     price_per_item: number;
//     total_price: number;
//     sale_date: string
// }

interface ISaleProductModal {
    open: boolean;
    handleClose: () => void;
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    handleSale: () => void;
}

const SaleProductModal = ({open, handleClose, saleData, setSaleData, handleSale}: ISaleProductModal) => {
    return (
        <CustomDialog
            open={open}
            handleClose={handleClose}
            title="Sale Product"
            maxWidth="xl"
        >
            <DialogContent>

                <TextField
                    label="Customer"
                    value={saleData.customer}
                    onChange={(e) => setSaleData({...saleData, customer: e.target.value})}
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
                    onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})}
                    fullWidth
                    margin="normal"
                />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleSale} sx={{mt: 2}}>
                    Save Sale
                </Button>
            </DialogActions>


        </CustomDialog>
    );
};

export default SaleProductModal;
