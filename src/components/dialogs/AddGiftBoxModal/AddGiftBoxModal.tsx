import React, {useEffect, useState} from "react";
import {useProducts} from "../../Provider/ProductContext";
import {
    Button, DialogActions,
    DialogContent,
    Grid,
} from "@mui/material";
import {IHandleAddNewGiftBox, IMaterial, IProduct} from "../../../utils/types";
import {usePackaging} from "../../Provider/PackagingContext";
import CustomDialog from "../CustomDialog/CustomDialog";
import ProductsSection from "./ProductsSection";
import PackagingSection from "./PackagingSection";
import GiftSetDetailsSection from "./GiftSetDetailsSection";
import SummarySection from "./SummarySection";
import CancelButton from "../../Buttons/CancelButton";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";

interface ICreateGiftBox {
    handleCloseGiftModal: () => void;
    openGiftModal: boolean;
    handleAddNewGiftBox: (giftBox:IHandleAddNewGiftBox) => void;
    isAuthenticated: boolean
}


const AddGiftBoxModal = ({
                             handleCloseGiftModal,
                             openGiftModal,
                             handleAddNewGiftBox,
                             isAuthenticated
                         }: ICreateGiftBox) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0); // Ціна набору
    const {products, fetchProductsFunc} = useProducts();
    const {packagingMaterials,fetchPackagingOptions} = usePackaging();
    const [selectedProducts, setSelectedProducts] = useState<{ product: IProduct, quantity: number }[]>([]);
    const [selectedPackaging, setSelectedPackaging] = useState<{ material: IMaterial, quantity: number }[]>([]);
    const [showSelectProduct, setShowSelectProduct] = useState(false);
    const [showSelectPackaging, setShowSelectPackaging] = useState(false);
    const {showSnackbarMessage} = useSnackbarMessage()

    useEffect(() => {
        fetchProductsFunc()
        fetchPackagingOptions();
    }, []);


    const handleProductSelect = (_: React.SyntheticEvent,
                                 value: IProduct | null) => {
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
                        showSnackbarMessage('Max quantity reached for this product.', 'warning'); // Show success
                        // message

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

    const handlePackagingSelect = (_: React.SyntheticEvent,
                                   value: IMaterial | null) => {
        if (value) {
            setSelectedPackaging((prev) => {
                const existingIndex = prev.findIndex(item => item.material.id === value.id);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    const existing = updated[existingIndex];
                    if (existing.quantity < value.available_quantity) {
                        existing.quantity += 1;
                    } else {
                        showSnackbarMessage('Max quantity reached for this packaging.', 'warning'); //
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
                : packagingMaterials.find((packaging:IMaterial) => packaging.id === id);
        };

        const availableQuantity = getItemById(itemId, type)?.available_quantity;

        if (availableQuantity!==undefined && newQuantity <= availableQuantity) {
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
            showSnackbarMessage('Quantity exceeds available stock.', "warning")
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
//     const getProductById = (id: number) => {
//         return products.find((product) => product.id === id);
//     };

    const calculateProfit = () => {
        const totalCost = calculateTotalCost();
        return price - totalCost;
    };


    return (
        <CustomDialog
            open={openGiftModal}
            title="Створити подарунковий набір"
            handleClose={handleCloseGiftModal}
            maxWidth="md"
            fullWidth
        >
            <DialogContent>
                <GiftSetDetailsSection {...{name, setName, description, setDescription, price, setPrice}} />


                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <ProductsSection
                            setShowSelectProduct={setShowSelectProduct}
                            showSelectProduct={showSelectProduct}
                            products={products}
                            handleProductSelect={handleProductSelect}
                            selectedProducts={selectedProducts}
                            handleQuantityChange={handleQuantityChange}
                            handleRemoveProduct={handleRemoveProduct}
                        />

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <PackagingSection handlePackagingSelect={handlePackagingSelect}
                                          handleQuantityChange={handleQuantityChange}
                                          handleRemoveMaterial={handleRemoveMaterial}
                                          packagingMaterials={packagingMaterials}
                                          selectedPackaging={selectedPackaging}
                                          setShowSelectPackaging={setShowSelectPackaging}
                                          showSelectPackaging={showSelectPackaging}/>
                    </Grid>


                </Grid>


                <SummarySection calculateProfit={calculateProfit} calculateTotalCost={calculateTotalCost}/>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleCloseGiftModal}/>

                <Button variant="contained" color="primary"
                        disabled={!isAuthenticated}
                        onClick={() => handleAddNewGiftBox({
                            name,
                            description,
                            price,
                            selectedProducts: selectedProducts.map((item) => ({
                                item_id: item.product.id,
                                quantity: item.quantity,
                            })),
                            selectedPackaging: selectedPackaging.map((item) => ({
                                item_id: item.material.id,
                                quantity: item.quantity,
                            }))
                        })}>
                    Save Gift Set
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddGiftBoxModal;
