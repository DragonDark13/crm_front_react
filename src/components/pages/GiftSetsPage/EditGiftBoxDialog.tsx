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
import QuantityField from "../../FormComponents/QuantityField";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import CancelButton from "../../Buttons/CancelButton";

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
    const [showSelectProduct, setShowSelectProduct] = useState(false);
    const [showSelectPackaging, setShowSelectPackaging] = useState(false);

    const {showSnackbarMessage} = useSnackbarMessage()

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

    const handleQuantityChange = (itemId: number, newQuantity: number, type: 'product' | 'packaging') => {
        if (newQuantity <= 0) return; // Не дозволяємо встановити кількість менше або рівно нулю

        // Функція для отримання доступного об'єкта за типом
        const getItemById = (id: number, type: 'product' | 'packaging') => {
            return type === 'product'
                ? products.find((product) => product.id === id)
                : packagingMaterials.find((packaging) => packaging.id === id);
        };

        const availableQuantity = getItemById(itemId, type)?.available_quantity;
        if (newQuantity <= availableQuantity) {
            if (type === 'product') {
                // Оновлюємо кількість продуктів
                setSelectedProducts((prevSelectedProducts) =>
                    prevSelectedProducts.map((item) =>
                        item.product_id === itemId
                            ? {...item, quantity: newQuantity}
                            : item
                    )
                );
            } else if (type === 'packaging') {
                // Оновлюємо кількість пакування
                setSelectedPackaging((prevSelectedPackaging) =>
                    prevSelectedPackaging.map((item) =>
                        item.packaging_id === itemId
                            ? {...item, quantity: newQuantity}
                            : item
                    )
                );
            }
        } else {
            showSnackbarMessage('Quantity exceeds available stock.', "warning")

        }
    };


    const handleIncreaseQuantity = (itemId, type) => {
        const setItems = type === "product" ? setSelectedProducts : setSelectedPackaging;
        setItems((prev) =>
            prev.map((item) =>
                item.item_id === itemId
                    ? {...item, quantity: item.quantity + 1}
                    : item
            )
        );
    };

    const handleDecreaseQuantity = (itemId, type) => {
        const setItems = type === "product" ? setSelectedProducts : setSelectedPackaging;
        setItems((prev) =>
            prev.map((item) =>
                item.item_id === itemId && item.quantity > 1
                    ? {...item, quantity: item.quantity - 1}
                    : item
            )
        );
    };

    const handleRemoveItem = (itemId, type) => {
        const setItems = type === "product" ? setSelectedProducts : setSelectedPackaging;
        setItems((prev) => prev.filter((item) => item.item_id !== itemId));
    };

    const handleProductSelect = (event, value: IProduct) => {
        if (value) {
            setSelectedProducts((prev) => {
                const existingProductIndex = prev.findIndex(item => item.product_id === value.id);

                if (existingProductIndex >= 0) {
                    const updatedProducts = [...prev];
                    const existingProduct = updatedProducts[existingProductIndex];

                    if (existingProduct.quantity < value.available_quantity) {
                        existingProduct.quantity += 1;
                    } else {
                        showSnackbarMessage('Max quantity reached for this product.', "warning")

                    }

                    return updatedProducts;
                } else {
                    return [...prev, {
                        product_id: value.id,
                        quantity: 1,
                        price: value.purchase_price_per_item,
                        name: value.name,
                        type: "product"
                    }];
                }
            });
        }
    };

    const handlePackagingSelect = (event, value: IMaterial) => {
        if (value) {
            setSelectedPackaging((prev) => {
                const existingIndex = prev.findIndex(item => item.packaging_id === value.id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    const existing = updated[existingIndex];
                    if (existing.quantity < value.available_quantity) {
                        existing.quantity += 1;
                    } else {
                        showSnackbarMessage('Max quantity reached for this packaging.', "warning")
                    }
                    return updated;
                } else {
                    return [...prev, {
                        packaging_id: value.id,
                        quantity: 1,
                        price: value.purchase_price_per_unit,
                        name: value.name,
                        type: "packaging"
                    }];
                }
            });
        }
    };

    const handleEditGiftBox = () => {
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
            <DialogTitle>Редагування подарункового набору {giftBox.name}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Назва набору" value={name} onChange={(e) => setName(e.target.value)}
                                   margin="normal"/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth label="Опис" value={description}
                                   onChange={(e) => setDescription(e.target.value)}
                                   margin="normal"/>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Ціна набору" type="number" value={price}
                                   onChange={(e) => setPrice(Number(e.target.value))} margin="normal"/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1" style={{marginTop: 20}}>Загальна
                            вартість: {calculateTotalCost().toFixed(2)} UAH</Typography>
                        <Typography variant="body1">Прибуток: {calculateProfit().toFixed(2)} UAH</Typography>
                    </Grid>
                </Grid>


                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="h6" style={{marginTop: 20}}>Продукти</Typography>
                        {selectedProducts.map((item) => (
                            <Grid container key={item.product_id} spacing={1} alignItems="center">
                                <Grid item xs={6}>{products.find((p) => p.id === item.product_id)?.name}</Grid>
                                <Grid item xs={6}>
                                    <QuantityField
                                        margin={"dense"}
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.product_id, Number(e.target.value), "product")}
                                        onIncrement={() => handleQuantityChange(item.product_id, item.quantity + 1, "product")}
                                        onDecrement={() => handleDecreaseQuantity(item.product_id, "product")}

                                    />
                                    {/*<Grid container alignItems="center" spacing={1}>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <IconButton*/}
                                    {/*            onClick={() => handleDecreaseQuantity(item.product_id, "product")}>*/}
                                    {/*            <RemoveIcon/>*/}
                                    {/*        </IconButton>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <TextField label="Кількість" value={item.quantity}*/}
                                    {/*                   onChange={(e) => handleQuantityChange(item.product_id, Number(e.target.value), "product")}*/}
                                    {/*                   type="number" fullWidth inputProps={{min: 1}}/>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <IconButton*/}
                                    {/*            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1, "product")}>*/}
                                    {/*            <AddIcon/>*/}
                                    {/*        </IconButton>*/}
                                    {/*    </Grid>*/}
                                    {/*</Grid>*/}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="h6" style={{marginTop: 20}}>Пакування</Typography>
                        {selectedPackaging.map((item) => (
                            <Grid container key={item.packaging_id} spacing={1} alignItems="center">
                                <Grid item
                                      xs={6}>{packagingMaterials.find((m) => m.id === item.packaging_id)?.name}</Grid>
                                <Grid item xs={6}>
                                    <QuantityField
                                        margin={"dense"}
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(item.packaging_id, Number(e.target.value), "packaging")}
                                        onIncrement={() => handleQuantityChange(item.packaging_id, item.quantity + 1, "product")}
                                        onDecrement={() => handleDecreaseQuantity(item.packaging_id, "packaging")}

                                    />

                                    {/*<Grid container alignItems="center" spacing={1}>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <IconButton*/}
                                    {/*            onClick={() => handleDecreaseQuantity(item.packaging_id, "packaging")}>*/}
                                    {/*            <RemoveIcon/>*/}
                                    {/*        </IconButton>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <TextField label="Кількість" value={item.quantity}*/}
                                    {/*                   onChange={(e) => handleQuantityChange(item.packaging_id, Number(e.target.value), "packaging")}*/}
                                    {/*                   type="number" fullWidth inputProps={{min: 1}}/>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item>*/}
                                    {/*        <IconButton*/}
                                    {/*            onClick={() => handleQuantityChange(item.packaging_id, item.quantity + 1, "packaging")}>*/}
                                    {/*            <AddIcon/>*/}
                                    {/*        </IconButton>*/}
                                    {/*    </Grid>*/}
                                    {/*</Grid>*/}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>


            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onClose}/>
                <Button onClick={handleEditGiftBox} variant={"contained"} color="primary">Зберегти</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditGiftBoxDialog;
