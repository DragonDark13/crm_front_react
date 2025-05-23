// hooks/useNewProduct.ts
import {useState} from "react";
import {INewProduct} from "../utils/types";
import {addProduct} from "../api/_product";
import {useProducts} from "../components/Provider/ProductContext";
import {useSnackbarMessage} from "../components/Provider/SnackbarMessageContext";

export const useNewProduct = () => {
    const [newProduct, setNewProduct] = useState<INewProduct>({
        name: '',
        supplier_id: '',
        total_quantity: 0,
        available_quantity: 0,
        sold_quantity: 0,
        purchase_total_price: 0.00,
        purchase_price_per_item: 0.00,
        category_ids: [],
        created_date: new Date().toISOString().slice(0, 10),
        selling_total_price: 0.00,
        selling_price_per_item: 0.00,
        selling_quantity: 0
    });

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const {fetchProductsFunc} = useProducts();
    const {showSnackbarMessage} = useSnackbarMessage();

    const resetNewProduct = () => {
        setNewProduct({
            name: '',
            supplier_id: '',
            total_quantity: 0,
            available_quantity: 0,
            sold_quantity: 0,
            purchase_total_price: 0.00,
            purchase_price_per_item: 0.00,
            category_ids: [],
            created_date: new Date().toISOString().slice(0, 10),
            selling_total_price: 0.00,
            selling_price_per_item: 0.00,
            selling_quantity: 0
        });
        setSelectedCategories([]);
    };

    const handleCategoryChange = (categoryIds: number[]) => {
        setSelectedCategories(categoryIds);
        setNewProduct((prev) => ({
            ...prev,
            category_ids: categoryIds,
        }));
    };

    const handleRemoveCategory = (categoryIdToRemove: number) => {
        handleCategoryChange(selectedCategories.filter(id => id !== categoryIdToRemove));
    };

    const handleAddProduct = async (onSuccess?: () => void) => {
        try {
            await addProduct(newProduct);
            await fetchProductsFunc();
            resetNewProduct();
            showSnackbarMessage('Product added successfully!', 'success');
            onSuccess?.();
        } catch (error) {
            console.error('Failed to add product', error);
            showSnackbarMessage('Failed to add product!', 'error');
        }
    };

    return {
        newProduct,
        setNewProduct,
        selectedCategories,
        handleCategoryChange,
        handleRemoveCategory,
        handleAddProduct,
        resetNewProduct
    };
};
