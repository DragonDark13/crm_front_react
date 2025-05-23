// Операції з продуктами
import {API_ENDPOINTS, axiosInstance, handleError, postResource, fetchResource} from "./api";
import {IEditProduct, INewProduct, IProduct, IPurchaseData, ISaleData} from "../utils/types";

export const fetchProducts = (): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.PRODUCTS);
};

// Функція для додавання продукту
export const addProduct = (newProduct: INewProduct) => {
    return axiosInstance.post('/add_new_product', newProduct)
        .catch(error => {
            console.error('Error adding product:', error);
            throw error;
        });
};

export const updateProduct = (productId: number, editProduct: IEditProduct): Promise<void> => {
    return axiosInstance.put(API_ENDPOINTS.PRODUCT(productId), editProduct).catch(handleError);
};

export const deleteProduct = (productId: number): Promise<void> => {
    return axiosInstance.delete(API_ENDPOINTS.PRODUCT(productId)).catch(handleError);
};

export const addPurchase = (productId: number, purchaseData: IPurchaseData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_PURCHASE(productId), purchaseData);
};

export const addSale = (productId: number, saleData: ISaleData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_SALE(productId), saleData);
};

export const fetchProductHistory = (productId: number) => {
    return axiosInstance.get(`/product/${productId}/history`);
};
