// Операції з продуктами
import {AxiosResponse} from "axios";
import {API_ENDPOINTS, deleteResource, fetchResource, fetchResponse, postResource, putResource} from "./api";
import {ApiMessageResponse, ProductInventoryResponse, ProductMutationResponse} from "./contracts";
import {IEditProduct, INewProduct, IProduct, IPurchaseData, ISaleData} from "../utils/types";

export const deleteAllProducts = (): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_ALL_PRODUCTS);
};

export const fetchProducts = (): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.PRODUCTS);
};

// Функція для додавання продукту
export const addProduct = (newProduct: INewProduct): Promise<ProductMutationResponse> => {
    return postResource<ProductMutationResponse>(API_ENDPOINTS.ADD_PRODUCT, newProduct);
};

export const updateProduct = (productId: number, editProduct: IEditProduct): Promise<ProductMutationResponse> => {
    return putResource<ProductMutationResponse>(API_ENDPOINTS.PRODUCT(productId), editProduct);
};

export const deleteProduct = (productId: number): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT(productId));
};

export const addPurchase = (productId: number, purchaseData: IPurchaseData): Promise<void> => {
    return postResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT_PURCHASE(productId), purchaseData);
};

export const addSale = (productId: number, saleData: ISaleData): Promise<void> => {
    return postResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT_SALE(productId), saleData);
};

export const fetchProductHistory = (productId: number): Promise<AxiosResponse<unknown>> => {
    return fetchResponse<unknown>(`/product/${productId}/history`);
};

export interface IProductInventoryData {
    actual_quantity: number;
    reason?: string;
}

export const runProductInventory = (productId: number, data: IProductInventoryData): Promise<ProductInventoryResponse> => {
    return postResource<ProductInventoryResponse>(API_ENDPOINTS.PRODUCT_INVENTORY(productId), data);
};
