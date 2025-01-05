import axios, {AxiosError, AxiosResponse} from 'axios';
import {
    ICustomer,
    ICustomerDetails,
    IEditProduct, IMaterial,
    INewProduct,
    IProduct,
    IPurchaseData,
    ISaleData,
    ISupplier
} from '../utils/types';

// Встановлення базового URL залежно від середовища
const getBaseURL = (): string => {
    return window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5000/api/'
        : 'https://aleksandrforupwork.pythonanywhere.com/api/';
};

// Створення екземпляра axios з базовою конфігурацією
const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Інтерсептор для обробки помилок
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// Константи для API-ендпоінтів
const API_ENDPOINTS = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    SUPPLIERS: '/suppliers',
    CUSTOMERS: '/customers',
    SUPPLIER_PURCHASE_HISTORY: (id: number) => `/supplier/${id}/purchase-history`,
    SUPPLIER_PRODUCTS: (id: number) => `/supplier/${id}/products`,
    CUSTOMER_DETAILS: (id: number) => `/customers/${id}`,
    PRODUCT_PURCHASE: (id: number) => `/product/${id}/purchase`,
    PRODUCT_SALE: (id: number) => `/product/${id}/sale`,
    PRODUCT: (id: number) => `/product/${id}`,
    PACKAGING_MATERIALS: '/get_all_packaging_materials',  // New endpoint for packaging materials
};

// Уніфікована обробка помилок
const handleError = (error: AxiosError): never => {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(errorMessage);
};

// Загальна функція для GET-запитів
const fetchResource = <T>(endpoint: string): Promise<T> => {
    return api.get(endpoint).then(response => response.data).catch(handleError);
};

// Загальна функція для POST-запитів
const postResource = <T>(endpoint: string, data: any): Promise<T> => {
    return api.post(endpoint, data).then(response => response.data).catch(handleError);
};

// Функції для API
export const loginUser = (username: string, password: string): Promise<string> => {
    return postResource<{ token: string }>(API_ENDPOINTS.LOGIN, {username, password}).then(data => data.token);
};

export const logoutUser = (): Promise<void> => {
    const token = localStorage.getItem('token');
    return api.post(API_ENDPOINTS.LOGOUT, {}, {
        headers: {'Authorization': `Bearer ${token}`},
    }).catch(handleError);
};

export const fetchProducts = (): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.PRODUCTS);
};

export const fetchGetAllCategories = (): Promise<string[]> => {
    return fetchResource<string[]>(API_ENDPOINTS.CATEGORIES);
};

export const addSupplier = (newSupplier: { name: string; contact_info: string | null }): Promise<ISupplier> => {
    return postResource<ISupplier>(API_ENDPOINTS.SUPPLIERS, newSupplier);
};

export const deleteProduct = (productId: number): Promise<void> => {
    return api.delete(API_ENDPOINTS.PRODUCT(productId)).catch(handleError);
};

export const addProduct = (newProduct: INewProduct): Promise<IProduct> => {
    return postResource<IProduct>(API_ENDPOINTS.PRODUCTS, newProduct);
};

export const addNewCategory = (name: string): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.CATEGORIES, {name});
};

export const updateProduct = (productId: number, editProduct: IEditProduct): Promise<void> => {
    return api.put(API_ENDPOINTS.PRODUCT(productId), editProduct).catch(handleError);
};

export const addPurchase = (productId: number, purchaseData: IPurchaseData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_PURCHASE(productId), purchaseData);
};

export const addSale = (productId: number, saleData: ISaleData): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.PRODUCT_SALE(productId), saleData);
};

export const fetchGetAllSuppliers = (): Promise<ISupplier[]> => {
    return fetchResource<ISupplier[]>(API_ENDPOINTS.SUPPLIERS);
};

export const fetchGetSupplierPurchaseHistory = (supplierId: number): Promise<{ purchase_history: any[]; products: IProduct[] }> => {
    return fetchResource<{ purchase_history: any[]; products: IProduct[] }>(API_ENDPOINTS.SUPPLIER_PURCHASE_HISTORY(supplierId));
};

export const fetchGetSupplierProducts = (supplierId: number): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.SUPPLIER_PRODUCTS(supplierId));
};

export const createCustomer = (customerData: ICustomerDetails): Promise<ICustomer> => {
    return postResource<ICustomer>(API_ENDPOINTS.CUSTOMERS, customerData);
};

export const fetchGetAllCustomers = (): Promise<ICustomer[]> => {
    return fetchResource<ICustomer[]>(API_ENDPOINTS.CUSTOMERS);
};

export const fetchCustomerDetails = (customerId: number): Promise<ICustomerDetails> => {
    return fetchResource<ICustomerDetails>(API_ENDPOINTS.CUSTOMER_DETAILS(customerId));
};

export const fetchProductHistory = (productId: number) => {
    return api.get(`/product/${productId}/history`);
};

export const onDeleteHistoryRecord = (productId: number, historyType: string, historyId: number) => {
    return api.delete(`/delete-history/${productId}/${historyType}/${historyId}`);
};

// Функція для отримання пакувальних матеріалів
export const fetchPackagingMaterials = (): Promise<{ materials: IMaterial[] }> => {
    return fetchResource<{ materials: IMaterial[] }>(API_ENDPOINTS.PACKAGING_MATERIALS);
};