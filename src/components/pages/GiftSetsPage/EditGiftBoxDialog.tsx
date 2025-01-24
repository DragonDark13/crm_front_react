import React, {useState} from "react";
import {
    Button,
    TextField,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from "@mui/material";
import {Autocomplete} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {useProducts} from "../../Provider/ProductContext";
import {usePackaging} from "../../Provider/PackagingContext";
import {IMaterial, IProduct} from "../../../utils/types";

const EditGiftBoxDialog = ({
                               open,
                               onClose,
                               giftBox,
                               onSave
                           }) => {
    const {products} = useProducts();
    const {packagingMaterials} = usePackaging();

    const [name, setName] = useState(giftBox.name);
    const [description, setDescription] = useState(giftBox.description);
    const [price, setPrice] = useState(giftBox.gift_selling_price);
    const [selectedProducts, setSelectedProducts] = useState(giftBox.products);
    const [selectedPackaging, setSelectedPackaging] = useState(giftBox.packagings);
    const [showSelectProduct, setShowSelectProduct] = useState(false);  // To toggle product selection
    const [showSelectPackaging, setShowSelectPackaging] = useState(false); // To toggle packaging selection

    const calculateTotalCost = () => {
        const productCost = selectedProducts.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        const packagingCost = selectedPackaging.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        return productCost + packagingCost;
    };

    const calculateProfit = () => {
        const totalCost = calculateTotalCost();
        return price - totalCost;
    };

    const handleQuantityChange = (itemId, newQuantity, type) => {
        if (newQuantity <= 0) return;

        const setItems = type === "product" ? setSelectedProducts : setSelectedPackaging;
        setItems((prev) =>
            prev.map((item) =>
                item.item_id === itemId ? {...item, quantity: newQuantity} : item
            )
        );
    };

    const handleRemoveItem = (itemId, type) => {
        const setItems = type === "product" ? setSelectedProducts : setSelectedPackaging;
        setItems((prev) => prev.filter((item) => item.item_id !== itemId));
    };

    const handleProductSelect = (event, value: IProduct) => {
        if (value) {
            setSelectedProducts((prev) => [
                ...prev,
                {
                    product_id: value.id,
                    quantity: 1,
                    price: value.purchase_price_per_item,
                    name: value.name,
                    type: "product"
                }
            ]);
        }
    };

    const handlePackagingSelect = (event, value: IMaterial) => {
        if (value) {
            setSelectedPackaging((prev) => [
                ...prev,
                {
                    packaging_id: value.id,
                    quantity: 1,
                    price: value.purchase_price_per_unit,
                    name: value.name,
                    type: "packaging"
                }
            ]);
        }
    };

    const handleSubmit = () => {
        const updatedGiftBox = {
            id: giftBox.id,
            name,
            description,
            gift_selling_price: price,
            items: [...selectedProducts, ...selectedPackaging]
        };
        onSave(updatedGiftBox);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Edit Gift Set</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Set Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />

                <Typography variant="h6" style={{marginTop: 20}}>
                    Products
                </Typography>
                {selectedProducts.map((item) => (
                    <Grid container key={item.product_id} spacing={2} alignItems="center">
                        <Grid item xs={6}>
                            {products.find((p) => p.id === item.product_id)?.name}
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Quantity"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleQuantityChange(
                                        item.product_id,
                                        Number(e.target.value),
                                        "product"
                                    )
                                }
                                type="number"
                                fullWidth
                                inputProps={{min: 1}}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <IconButton
                                color="secondary"
                                onClick={() => handleRemoveItem(item.product_id, "product")}
                            >
                                Remove
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}

                {!showSelectProduct ? (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowSelectProduct(true)} // Show select when button is clicked
                    >
                        Add Product
                    </Button>
                ) : (
                    <Grid container>
                        <Grid item xs={9}>
                            <Autocomplete
                                onChange={handleProductSelect}
                                options={products.filter((product) => {
                                    const selected = selectedProducts.find(
                                        (item) => item.product_id === product.id
                                    );
                                    return (
                                        product.available_quantity > 0 &&
                                        (!selected || product.available_quantity > selected.quantity)
                                    );
                                })}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => <TextField {...params} label="Select a Product"/>}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                disableClearable
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.name} ({option.available_quantity} шт)
                                    </li>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setShowSelectProduct(false)} // Close the selector
                            >
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                )}

                <Typography variant="h6" style={{marginTop: 20}}>
                    Packaging
                </Typography>

                {selectedPackaging.map((item) => (
                    <Grid container key={item.packaging_id} spacing={2} alignItems="center">
                        <Grid item xs={6}>
                            {packagingMaterials.find((m) => m.id === item.packaging_id)?.name}
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Quantity"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleQuantityChange(
                                        item.packaging_id,
                                        Number(e.target.value),
                                        "packaging"
                                    )
                                }
                                type="number"
                                fullWidth
                                inputProps={{min: 1}}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <IconButton
                                color="secondary"
                                onClick={() => handleRemoveItem(item.packaging_id, "packaging")}
                            >
                                Remove
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}

                {!showSelectPackaging ? (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        onClick={() => setShowSelectPackaging(true)} // Show select when button is clicked
                    >
                        Add Packaging
                    </Button>
                ) : (
                    <Grid container>
                        <Grid item xs={9}>
                            <Autocomplete
                                onChange={handlePackagingSelect}
                                options={packagingMaterials.filter((packaging) => {
                                    const selected = selectedPackaging.find(
                                        (item) => item.packaging_id === packaging.id
                                    );
                                    return !selected;
                                })}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => <TextField {...params} label="Select Packaging"/>}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                disableClearable
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.name}
                                    </li>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => setShowSelectPackaging(false)} // Close the selector
                            >
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                )}

                <TextField
                    fullWidth
                    label="Set Price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    margin="normal"
                />

                <Typography variant="h6" style={{marginTop: 20}}>
                    Total Cost: {calculateTotalCost().toFixed(2)} UAH
                </Typography>
                <Typography variant="h6">
                    Profit: {calculateProfit().toFixed(2)} UAH
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditGiftBoxDialog;
