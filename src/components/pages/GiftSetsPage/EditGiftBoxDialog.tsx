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
import {useProducts} from "../../Provider/ProductContext";
import {usePackaging} from "../../Provider/PackagingContext";
import {IGiftSet, IGiftUpdateItem, IMaterial, IProduct} from "../../../utils/types";
import QuantityField from "../../FormComponents/QuantityField";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import CancelButton from "../../Buttons/CancelButton";
import CustomDialog from "../../dialogs/CustomDialog/CustomDialog";
import ProductNameField from "../../FormComponents/ProductNameField";
import PriceField from "../../FormComponents/PriceField";

interface IEditGiftBoxDialog {
    open: boolean;
    onClose: () => void;
    giftBox:IGiftSet
    onSaveGiftBox: (giftBox:IGiftUpdateItem) => void;
    isAuthenticated: boolean;
}


const EditGiftBoxDialog = ({
                               open,
                               onClose,
                               giftBox,
                                onSaveGiftBox,
                               isAuthenticated
                           }:IEditGiftBoxDialog) => {
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
        if (availableQuantity!==undefined && newQuantity <= availableQuantity) {
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


    const handleEditGiftBox = () => {
        const updatedGiftBox = {
            id: giftBox.id,
            name,
            description,
            gift_selling_price: price,
            items: [...selectedProducts, ...selectedPackaging]
        };
        onSaveGiftBox(updatedGiftBox);
        onClose();
    };

    return (
        <CustomDialog maxWidth="md" title={`Редагування подарункового набору ${giftBox.name}`} handleClose={onClose}
                      open={open}>

            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <ProductNameField label={"Назва набору"} value={name} onChange={(e) => setName(e.target.value)}
                                          />
                        {/*<TextField fullWidth label="Назва набору" value={name} onChange={(e) => setName(e.target.value)}*/}
                        {/*           margin="normal"/>*/}
                    </Grid>
                    <Grid item xs={6}>
                        <ProductNameField label={"Опис"} value={description}
                                          onChange={(e) => setDescription(e.target.value)} />

                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <PriceField label={"Ціна набору"} value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}/>
                        {/*<TextField fullWidth label="Ціна набору" type="number" value={price}*/}
                        {/*           onChange={(e) => setPrice(Number(e.target.value))} margin="normal"/>*/}
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
                                        onDecrement={() => handleQuantityChange(item.product_id, item.quantity - 1, "product")}

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
                                        onDecrement={() => handleQuantityChange(item.packaging_id, item.quantity - 1, "packaging")}

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
                <Button disabled={!isAuthenticated} onClick={handleEditGiftBox} variant={"contained"}
                        color="primary">Зберегти</Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default EditGiftBoxDialog;
