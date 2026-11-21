import axios, {AxiosHeaders, AxiosRequestConfig, AxiosResponse} from 'axios';
import {IonDeleteHistoryRecord} from "../utils/types";
import {ApiErrorResponse} from "./contracts";

// Встановлення базового URL залежно від середовища
const getBaseURL = (): string => {
    return window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5000/api/'
        : 'https://aleksandrforupwork.pythonanywhere.com/api/';
};

// Створення єдиного екземпляра axios з базовою конфігурацією
export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Інтерсептор для автоматичного додавання JWT до запитів
axiosInstance.interceptors.request.use(config => {
    const isLoginRequest = config.url?.split('?')[0].endsWith('/login');

    config.headers = AxiosHeaders.from(config.headers);

    if (isLoginRequest) {
        // Авторизація має залишатися доступною без попереднього токена.
        config.headers.delete('Authorization');
        return config;
    }

    const token = localStorage.getItem('token');

    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    } else {
        config.headers.delete('Authorization');
    }

    return config;
});

// Інтерсептор не перетворює помилки: їх нормалізація виконується в API helpers.
axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

// Константи для API-ендпоінтів
export const API_ENDPOINTS = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    PRODUCTS: '/get_all_products/',
    ADD_PRODUCT: '/add_new_product',
    DELETE_ALL_PRODUCTS: '/delete_all_products',
    DELETE_ALL_MATERIALS: '/delete_all_materials',
    PACKAGING_SUPPLIERS: '/get_all_packaging_suppliers',
    ADD_PACKAGING_SUPPLIER: '/add_new_packaging_suppliers',
    UPDATE_PACKAGING_STATUS: '/update_packaging_status',
    PURCHASE_CURRENT_PACKAGING: '/purchase_current_packaging',
    CATEGORIES: '/categories/get_all_categories',
    ADD_NEW_CATEGORIES: '/add_new_category',
    ADD_SUPPLIERS: '/create_supplier',
    EDIT_SUPPLIERS: (id: number) => `/supplier_edit/${id}`,
    EDIT_PACKAGING_SUPPLIER: (id: number) => `/packaging_supplier_edit/${id}`,
    GET_ALL_SUPPLIERS: '/suppliers/get_suppliers_list',
    CUSTOMERS: '/customers/get_all_customers',
    CREATED_CUSTOMER: '/customer_create',
    SUPPLIER_PURCHASE_HISTORY: (id: number) => `/supplier/${id}/purchase-history`,
    SUPPLIER_PRODUCTS: (id: number) => `/supplier/${id}/products`,
    DELETE_SUPPLIER: (id: number) => `/delete_supplier/${id}`,
    DELETE_PACKAGING_SUPPLIER: (id: number) => `/delete_packaging_supplier/${id}`,
    CUSTOMER_DETAILS: (id: number) => `/customers_details/${id}`,
    PRODUCT_PURCHASE: (id: number) => `/product/${id}/purchase`,
    PRODUCT_SALE: (id: number) => `/product/${id}/sale`,
    PRODUCT_INVENTORY: (id: number) => `/product/${id}/inventory`,
    PRODUCT: (id: number) => `/product/${id}`,
    GET_ALL_PACKAGING_MATERIALS: '/packaging/get_all_packaging_materials',
    CURRENT_PACKAGING_HISTORY: (materialId: number) => `/materials/${materialId}/history`,
    CURRENT_PACKAGING_SUPPLIER_PURCHASE_HISTORY: (id: number) => `/packaging-supplier/${id}/purchase-history`,
    ADD_NEW_PACKAGING_MATERIAL: '/packaging_materials/purchase',
    CREATE_GIFT_SET: '/create_gift_set',
    GET_ALL_GIFT_SETS: '/get_all_gift_sets',
    REMOVE_GIFT_SET: (id: number) => `/remove_gift_set/${id}`,
    UPDATE_GIFT_SET: (id: number) => `/update_gift_set/${id}`,
    SELL_GIFT_SET: (id: number) => `/sell_gift_set/${id}`,
    DELETE_HISTORY: ({
                         productId, historyType, historyId
                     }: IonDeleteHistoryRecord) => `/delete-history/${productId}/${historyType}/${historyId}`,
    GET_ALL_INVESTMENTS: '/investments/get_all_investments',
    CREATE_NEW_INVESTMENT: '/create_new_investments',
    DELETE_INVESTMENT: (id: number) => `/delete_investments/${id}`,
    DELETE_ALL_INVESTMENTS: '/delete_all_investments',
    GET_ALL_PURCHASE_HISTORY: '/get_all_purchase_history',
    SALES_HISTORY: '/get_all_sales_history',
    FINANCIAL_JOURNAL: '/financial-journal',
    CUSTOMER_RETURNS: '/returns',
    CREATE_CUSTOMER_RETURN: (saleId: number) => `/sales/${saleId}/returns`,
    DASHBOARD_MONTHLY_SALES: '/statistics/sales/monthly',
    DASHBOARD_MONTHLY_PURCHASES: '/statistics/purchases/monthly',
    DASHBOARD_TOP_PRODUCTS: '/statistics/top-products',
    DASHBOARD_STOCK: '/statistics/stock',
    DASHBOARD_PROFIT_EXPENSE: '/statistics/profit-expense',
    DASHBOARD_CUSTOMER_ACTIVITY: '/statistics/customer-activity'
};

const MAX_GET_RETRIES = 2;
const RETRY_DELAY_MS = 300;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const isRetryableGetError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error) || error.code === 'ERR_CANCELED') {
        return false;
    }

    return !error.response || RETRYABLE_STATUSES.has(error.response.status);
};

const waitBeforeRetry = (delay: number, signal?: AbortSignal): Promise<void> => {
    if (signal?.aborted) {
        return Promise.reject(new axios.CanceledError('Request canceled'));
    }

    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            signal?.removeEventListener('abort', handleAbort);
            resolve();
        }, delay);

        const handleAbort = () => {
            window.clearTimeout(timeoutId);
            signal?.removeEventListener('abort', handleAbort);
            reject(new axios.CanceledError('Request canceled'));
        };

        signal?.addEventListener('abort', handleAbort, {once: true});
    });
};

const getWithRetry = async <T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
) => {
    for (let attempt = 0; ; attempt += 1) {
        try {
            return await axiosInstance.get<T>(endpoint, config);
        } catch (error) {
            if (
                attempt >= MAX_GET_RETRIES
                || config.signal?.aborted
                || !isRetryableGetError(error)
            ) {
                throw error;
            }

            await waitBeforeRetry(RETRY_DELAY_MS * (attempt + 1), config.signal as AbortSignal | undefined);
        }
    }
};

// Уніфікована обробка повідомлень про помилки
export const getApiErrorMessage = (error: unknown, fallback = 'Unknown error'): string => {
    if (axios.isCancel(error)) {
        return 'Запит скасовано';
    }

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.error
            || error.response?.data?.message
            || error.response?.data?.details
            || error.message
            || fallback;
    }

    return error instanceof Error ? error.message : fallback;
};

export const handleError = (error: unknown): never => {
    if (axios.isAxiosError(error) || error instanceof Error) {
        throw error;
    }

    throw new Error(getApiErrorMessage(error));
};

// Загальна функція для GET-запитів.
// Повторюються лише тимчасові помилки GET; мутації автоматично не повторюються.
export const fetchResponse = async <T = unknown>(
    endpoint: string,
    config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> => {
    try {
        return await getWithRetry<T>(endpoint, config);
    } catch (error) {
        return handleError(error);
    }
};

export const fetchResource = async <T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
): Promise<T> => {
    try {
        const response = await getWithRetry<T>(endpoint, config);
        return response.data;
    } catch (error) {
        return handleError(error);
    }
};

// Загальна функція для POST-запитів
export const postResource = <T>(
    endpoint: string,
    data: unknown,
    config: AxiosRequestConfig = {}
): Promise<T> => {
    return axiosInstance.post<T>(endpoint, data, config).then(response => response.data).catch(handleError);
};

export const putResource = <T>(
    endpoint: string,
    data: unknown,
    config: AxiosRequestConfig = {}
): Promise<T> => {
    return axiosInstance.put<T>(endpoint, data, config).then(response => response.data).catch(handleError);
};

export const deleteResource = <T>(
    endpoint: string,
    config: AxiosRequestConfig = {}
): Promise<T> => {
    return axiosInstance.delete<T>(endpoint, config).then(response => response.data).catch(handleError);
};

export const exportToExcel = async (productIds: number[]) => {
    try {
        const response = await axiosInstance.post(
            "/export-products-excel",
            {product_ids: productIds},
            {
                responseType: "blob",
            }
        );

        const timestamp = new Date().toLocaleDateString().replace(/[-:.]/g, "_");
        const filename = `Products_${timestamp}.xlsx`;

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Помилка експорту:", error);
    }
};
