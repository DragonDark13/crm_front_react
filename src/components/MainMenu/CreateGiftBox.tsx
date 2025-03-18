import React, {useState} from "react";
import axios from "axios";
import {useProducts} from "../Provider/ProductContext";
import {
    Autocomplete,
    Button, DialogActions,
    DialogContent,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {IMaterial, IProduct} from "../../utils/types";
import {usePackaging} from "../Provider/PackagingContext";
import {axiosInstance} from "../../api/api";
import CustomDialog from "../dialogs/CustomDialog/CustomDialog";

interface ICreateGiftBox {
    handleClose: () => void;
    open: boolean;
}


const CreateGiftBox = ({handleClose, open}: ICreateGiftBox) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0); // Ціна набору
    const [items, setItems] = useState([]); // Для всіх товарів
    const {products} = useProducts();
    const {packagingMaterials} = usePackaging();
    const [selectedProducts, setSelectedProducts] = useState<{ product: IProduct, quantity: number }[]>([]);
    const [selectedPackaging, setSelectedPackaging] = useState<{ material: IMaterial, quantity: number }[]>([]);
    const [showSelectProduct, setShowSelectProduct] = useState(false);
    const [showSelectPackaging, setShowSelectPackaging] = useState(false);

    const handleProductSelect = (event: any, value: any) => {
        if (value) {
            // Перевіряємо чи вже обраний цей продукт
            setSelectedProducts((prev) => {
                // Шукаємо продукт в списку
                const existingProductIndex = prev.findIndex(item => item.product.id === value.id);

                if (existingProductIndex >= 0) {
                    // Якщо продукт вже є, перевіряємо доступну кількість
                    const updatedProducts = [...prev];
                    const existingProduct = updatedProducts[existingProductIndex];

                    if (existingProduct.quantity < value.available_quantity) {
                        // Якщо кількість обраного товару менше доступної кількості, збільшуємо на 1
                        existingProduct.quantity += 1;
                    } else {
                        // Якщо досягнута максимальна кількість, нічого не робимо
                        alert('Max quantity reached for this product.');
                    }

                    return updatedProducts;
                } else {
                    // Якщо продукт новий, додаємо його до списку з кількістю 1
                    return [...prev, {product: value, quantity: 1}];
                }
            });
            setShowSelectProduct(false); // Сховуємо select після вибору товару
        }
    };

    const handlePackagingSelect = (event: any, value: any) => {
        if (value) {
            setSelectedPackaging((prev) => {
                const existingIndex = prev.findIndex(item => item.material.id === value.id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    const existing = updated[existingIndex];
                    if (existing.quantity < value.available_quantity) {
                        existing.quantity += 1;
                    } else {
                        alert('Max quantity reached for this packaging.');
                    }
                    return updated;
                } else {
                    return [...prev, {material: value, quantity: 1}];
                }
            });
            setShowSelectPackaging(false);
        }
    };

    const calculateTotalCost = () => {
        const productCost = selectedProducts.reduce(
            (total, item) =>
                total + item.product.purchase_price_per_item * item.quantity,
            0
        );

        const packagingCost = selectedPackaging.reduce(
            (total, item) =>
                total + item.material.purchase_price_per_unit * item.quantity,
            0
        );

        return productCost + packagingCost;
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
                        item.product.id === itemId
                            ? {...item, quantity: newQuantity}
                            : item
                    )
                );
            } else if (type === 'packaging') {
                // Оновлюємо кількість пакування
                setSelectedPackaging((prevSelectedPackaging) =>
                    prevSelectedPackaging.map((item) =>
                        item.material.id === itemId
                            ? {...item, quantity: newQuantity}
                            : item
                    )
                );
            }
        } else {
            alert('Quantity exceeds available stock.');
        }
    };


    const handleRemoveProduct = (productId: number) => {
        setSelectedProducts((prevSelectedProducts) =>
            prevSelectedProducts.filter((item) => item.product.id !== productId)
        );
    };

    const handleRemoveMaterial = (materialId: number) => {
        setSelectedPackaging((prevSelectedPAckaging) =>
            prevSelectedPAckaging.filter((item) => item.material.id !== materialId)
        );
    };

// Функція для отримання продукту за ID (для доступу до `available_quantity` та іншого)
    const getProductById = (id: number) => {
        return products.find((product) => product.id === id);
    };

    const calculateProfit = () => {
        const totalCost = calculateTotalCost();
        return price - totalCost;
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert("The gift set must have a name.");
            return;
        }

        if (selectedProducts.length === 0 && selectedPackaging.length === 0) {
            alert("The gift set must contain at least one product or packaging.");
            return;
        }

        const payload = {
            name,
            description,
            gift_selling_price: price,
            items: [
                ...selectedProducts.map((item) => ({
                    item_id: item.product.id,
                    item_type: "product",
                    quantity: item.quantity,
                    price: item.product.purchase_price_per_item
                })),
                ...selectedPackaging.map((item) => ({
                    item_id: item.material.id,
                    item_type: "packaging",
                    quantity: item.quantity,
                    price: item.material.purchase_price_per_unit,
                })),
            ],
        };

        try {
            await axiosInstance.post("/create_gift_set", payload);
            alert("Gift set created successfully!");
        } catch (error) {
            console.error("Failed to create gift set", error);
            alert("An error occurred while creating the gift set.");
        }
    };

    return (
        <CustomDialog
            open={open}
            title="Створити подарунковий набір"
            handleClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label={'Назва Набору'}
                            margin="normal"
                            fullWidth
                            type="text"
                            placeholder="Set name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label={'Опис'}
                            margin="normal"
                            fullWidth
                            type="text" placeholder={"description"} value={description}
                            onChange={(e) => setDescription(e.target.value)}/>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Ціна продажу"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </Grid>
                </Grid>


                <h2>Products</h2>
                <div>
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
                                        const selected = selectedProducts.find((item) => item.product.id === product.id);
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
                                    onClick={() => setShowSelectProduct(false)} // Сховуємо селектор
                                >
                                    Закрити
                                </Button>
                            </Grid>
                        </Grid>
                    )}

                    <div style={{marginTop: 20}}>
                        {selectedProducts.map((item) => {

                            const product = item.product;
                            const availableQuantity = product.available_quantity;
                            const costPerItem = product.purchase_price_per_item;
                            const totalCost = item.quantity * costPerItem;

                            return (<Grid container key={item.product.id} spacing={2} alignItems="center">
                                    <Grid item xs={6}>
                                        {item.product.name}
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label={`Quantity`}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    product.id,
                                                    Number(e.target.value),
                                                    'product'
                                                )
                                            }
                                            type="number"
                                            fullWidth
                                            inputProps={{
                                                min: 1,
                                                max: availableQuantity,  // Обмеження на кількість
                                            }}
                                        />
                                        <div style={{marginTop: 5}}>
                                            <small>
                                                Available: {availableQuantity} pcs
                                            </small>
                                        </div>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                handleQuantityChange(product.id, item.quantity + 1, "product")
                                            }
                                            disabled={item.quantity >= availableQuantity}
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() =>
                                                item.quantity > 1
                                                    ? handleQuantityChange(product.id, item.quantity - 1, "product")
                                                    : null
                                            }
                                        >
                                            <RemoveIcon/>
                                        </IconButton>
                                        <Button
                                            color="error"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <div>
                                            <strong>Cost per item: </strong>
                                            {costPerItem} UAH
                                        </div>
                                        <div>
                                            <strong>Total cost: </strong>
                                            {totalCost.toFixed(2)} UAH
                                        </div>
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </div>
                </div>

                <h2>Packaging</h2>
                <div>
                    {!showSelectPackaging ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon/>}
                            onClick={() => setShowSelectPackaging(true)}
                        >
                            Add Packaging
                        </Button>
                    ) : (
                        <Grid container>
                            <Grid item xs={9}>
                                <Autocomplete
                                    onChange={handlePackagingSelect}
                                    options={packagingMaterials.filter((material) => {
                                        const selected = selectedPackaging.find((item) => item.material.id === material.id);
                                        return (
                                            material.available_quantity > 0 &&
                                            (!selected || material.available_quantity > selected.quantity)
                                        );
                                    })}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => <TextField {...params} label="Select Packaging"/>}
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
                                    onClick={() => setShowSelectPackaging(false)}
                                >
                                    Закрити
                                </Button>


                            </Grid>
                        </Grid>
                    )}

                    {/* Відображення обраного пакування */}
                    <div>
                        {selectedPackaging.map((item) => {

                            const material = item.material;
                            const availableQuantity = material.available_quantity;
                            const costPerItem = material.purchase_price_per_unit;
                            const totalCost = item.quantity * costPerItem;

                            return (<Grid container key={item.material.id} spacing={2} alignItems="center">
                                    <Grid item xs={6}>
                                        {item.material.name}
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            label={`Quantity`}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    material.id,
                                                    Number(e.target.value),
                                                    'packaging'
                                                )
                                            }
                                            type="number"
                                            fullWidth
                                            inputProps={{
                                                min: 1,
                                                max: availableQuantity,  // Обмеження на кількість
                                            }}
                                        />
                                        <div style={{marginTop: 5}}>
                                            <small>
                                                Available: {availableQuantity} pcs
                                            </small>
                                        </div>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <IconButton
                                            color="primary"
                                            onClick={() =>
                                                handleQuantityChange(material.id, item.quantity + 1, "packaging")
                                            }
                                            disabled={item.quantity >= availableQuantity}
                                        >
                                            <AddIcon/>
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() =>
                                                item.quantity > 1
                                                    ? handleQuantityChange(material.id, item.quantity - 1, "packaging")
                                                    : null
                                            }
                                        >
                                            <RemoveIcon/>
                                        </IconButton>
                                        <Button
                                            color="error"
                                            onClick={() => handleRemoveMaterial(material.id)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <div>
                                            <strong>Cost per item: </strong>
                                            {costPerItem} UAH
                                        </div>
                                        <div>
                                            <strong>Total cost: </strong>
                                            {totalCost.toFixed(2)} UAH
                                        </div>
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </div>
                </div>


                <Typography variant="h6" style={{marginTop: 20}}>
                    Загальна собівартість: {calculateTotalCost().toFixed(2)} грн
                </Typography>
                <Typography variant="h6">
                    Прибуток: {calculateProfit().toFixed(2)} грн
                </Typography>
            </DialogContent>
            <DialogActions>

                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Save Gift Set
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateGiftBox;
