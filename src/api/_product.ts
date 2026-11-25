// Операції з продуктами
import {AxiosResponse} from "axios";
import {API_ENDPOINTS, axiosInstance, deleteResource, fetchResource, fetchResponse, postResource, putResource} from "./api";
import {ApiMessageResponse, ProductHistoryResponse, ProductInventoryResponse, ProductMutationResponse} from "./contracts";
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

export const deleteProduct = (
    productId: number,
    mode: 'product_only' | 'all_related' = 'product_only'
): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT(productId), {
        params: {mode}
    });
};

export const addPurchase = (productId: number, purchaseData: IPurchaseData): Promise<ApiMessageResponse> => {
    return postResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT_PURCHASE(productId), purchaseData);
};

export const addSale = (productId: number, saleData: ISaleData): Promise<ApiMessageResponse> => {
    return postResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT_SALE(productId), saleData);
};

export const fetchProductHistory = (productId: number): Promise<AxiosResponse<ProductHistoryResponse>> => {
    return fetchResponse<ProductHistoryResponse>(`/product/${productId}/history`);
};

export interface IProductInventoryData {
    actual_quantity: number;
    reason?: string;
    inventory_date: string;
}

export const runProductInventory = (productId: number, data: IProductInventoryData): Promise<ProductInventoryResponse> => {
    return postResource<ProductInventoryResponse>(API_ENDPOINTS.PRODUCT_INVENTORY(productId), data);
};


export interface ProductImagesResponse {
    message: string;
    images: import("../utils/types").IProductImage[];
}

export const uploadProductImages = (
    productId: number,
    files: File[]
): Promise<ProductImagesResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    return axiosInstance.post<ProductImagesResponse>(
        API_ENDPOINTS.PRODUCT_IMAGES(productId),
        formData,
        {headers: {"Content-Type": "multipart/form-data"}}
    ).then(response => response.data);
};

export const deleteProductImage = (
    productId: number,
    imageId: number
): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.PRODUCT_IMAGE(productId, imageId));
};
