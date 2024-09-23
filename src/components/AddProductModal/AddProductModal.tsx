import {
    TextField,
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    DialogContent, DialogActions
} from '@mui/material';
import {ICategory, INewProduct} from "../../App";
import CustomDialog from "../CustomDialog/CustomDialog";

interface IAddProductModal {
    open: boolean,
    handleClose: () => void,
    newProduct: INewProduct,
    setNewProduct: (product: INewProduct) => void,
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
        <CustomDialog
            open={open}
            handleClose={handleClose}
            title="Add New Product"
            maxWidth="xl"
        >
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

            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleAdd} sx={{mt: 2}}>
                    Add Product
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddProductModal;
