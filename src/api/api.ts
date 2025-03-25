import axios, {AxiosError, AxiosResponse} from 'axios';
// Встановлення базового URL залежно від середовища
const getBaseURL = (): string => {
    return window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:5000/api/'
        : 'https://aleksandrforupwork.pythonanywhere.com/api/';
};

// Створення екземпляра axios з базовою конфігурацією
export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});


// Інтерсептор для обробки помилок
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
// Константи для API-ендпоінтів
export const API_ENDPOINTS = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    ADD_NEW_CATEGORIES: '/add_new_category',
    ADD_SUPPLIERS: '/create_supplier',
    EDIT_SUPPLIERS: (id: number) => `/supplier_edit/${id}`,
    GET_ALL_SUPPLIERS: '/suppliers/list',
    CUSTOMERS: '/get_all_customers',
    CREATED_CUSTOMER: '/customer_create',
    SUPPLIER_PURCHASE_HISTORY: (id: number) => `/supplier/${id}/purchase-history`,
    SUPPLIER_PRODUCTS: (id: number) => `/supplier/${id}/products`,
    DELETE_SUPPLIER: (id: number) => `/delete_supplier/${id}`,
    CUSTOMER_DETAILS: (id: number) => `/customers_details/${id}`,
    PRODUCT_PURCHASE: (id: number) => `/product/${id}/purchase`,
    PRODUCT_SALE: (id: number) => `/product/${id}/sale`,
    PRODUCT: (id: number) => `/product/${id}`,
    GET_ALL_PACKAGING_MATERIALS: '/get_all_packaging_materials',  // New endpoint for packaging materials
    CURRENT_PACKAGING_HISTORY: (materialId: number) => `/materials/${materialId}/history`,
    ADD_NEW_PACKAGING_MATERIAL: '/packaging_materials/purchase',
    CREATE_GIFT_SET: '/create_gift_set',
    GET_ALL_GIFT_SETS: '/get_all_gift_sets',
    REMOVE_GIFT_SET: (id: number) => `/remove_gift_set/${id}`,
    UPDATE_GIFT_SET: (id: number) => `/update_gift_set/${id}`,
    SELL_GIFT_SET: (id: number) => `/sell_gift_set/${id}`,

};

// Уніфікована обробка помилок
export const handleError = (error: AxiosError): never => {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    throw new Error(errorMessage);
};

// Загальна функція для GET-запитів
export const fetchResource = <T>(endpoint: string): Promise<T> => {
    return axiosInstance.get(endpoint).then(response => response.data).catch(handleError);
};

// Загальна функція для POST-запитів
export const postResource = <T>(endpoint: string, data: any): Promise<T> => {
    return axiosInstance.post(endpoint, data).then(response => response.data).catch(handleError);
};

export const putResource = <T>(endpoint: string, data: any): Promise<T> => {
    return axiosInstance.put(endpoint, data).then(response => response.data).catch(handleError);
};

export const deleteResource = <T>(endpoint: string): Promise<T> => {
    return axiosInstance.delete(endpoint).then(response => response.data).catch(handleError);
};


export const exportToExcel = async (productIds: number[]) => {
    try {
        const response = await axiosInstance.post(
            "/export-products-excel",
            {product_ids: productIds},
            {
                responseType: "blob", // Вказати тип для файлів
            }
        );

        // Створення посилання для завантаження файлу
        const timestamp = new Date().toLocaleDateString().replace(/[-:.]/g, "_"); // Створення унікального timestamp
        const filename = `Products_${timestamp}.xlsx`; // Формування імені файлу

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename); // Ім'я файлу змінене на унікальне
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Помилка експорту:", error);
    }
};
