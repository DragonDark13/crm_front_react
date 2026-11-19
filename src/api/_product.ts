// Операції з продуктами
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";
import {IEditProduct, INewProduct, IProduct, IPurchaseData, ISaleData} from "../utils/types";

export const deleteAllProducts = (): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_ALL_PRODUCTS);
};

export const fetchProducts = (): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.PRODUCTS);
};

// Функція для додавання продукту
export const addProduct = (newProduct: INewProduct) => {
    return postResource(API_ENDPOINTS.ADD_PRODUCT, newProduct);
};

export const updateProduct = (productId: number, editProduct: IEditProduct) => {
    return putResource(API_ENDPOINTS.PRODUCT(productId), editProduct);
};

export const deleteProduct = (productId: number) => {
    return deleteResource(API_ENDPOINTS.PRODUCT(productId));
};

export const addPurchase = (productId: number, purchaseData: IPurchaseData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_PURCHASE(productId), purchaseData);
};

export const addSale = (productId: number, saleData: ISaleData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_SALE(productId), saleData);
};

export interface IProductHistoryResponse {
    stock_history: unknown[];
    purchase_history: unknown[];
    sale_history: unknown[];
}

export const fetchProductHistory = (productId: number): Promise<IProductHistoryResponse> => {
    return fetchResource<IProductHistoryResponse>(`/product/${productId}/history`);
};

export interface IProductInventoryData {
    actual_quantity: number;
    reason?: string;
}

export const runProductInventory = (productId: number, data: IProductInventoryData) => {
    return postResource(API_ENDPOINTS.PRODUCT_INVENTORY(productId), data);
};
