import axios, {AxiosError} from 'axios';
import {ICustomer, ICustomerDetails, IEditProduct, INewProduct, IPurchaseData, ISaleData} from "../utils/types";


// Створення екземпляра axios з правильним типом конфігурації

console.log(import.meta.env.MODE);
const api = axios.create();

// Встановлюємо базову URL залежно від середовища
if (window.location.hostname === 'localhost') {
    api.defaults.baseURL = 'http://127.0.0.1:5000/api/'; // Локальний сервер
} else {
    api.defaults.baseURL = 'https://aleksandrforupwork.pythonanywhere.com/api/'; // Віддалений сервер
}
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const loginUser = (username: string, password: string) => {
    return api.post('/login', { username, password })
        .then(response => {
            return response.data.token; // Припускаємо, що токен повертається тут
        })
        .catch(error => {
            console.error('Login failed:', error);
            throw new Error('Invalid username or password');
        });
};

// Функція для отримання списку продуктів
export const fetchProducts = () => {
    return api.get('/products')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching products:', error);
            return [];
        });
};

export const fetchGetAllCategories = () => {
    return api.get('/categories')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching categories:', error);
            return [];
        });
}

export const addSupplier = (newSupplier: { name: string, contact_info: string | null }) => {
    return api.post('/supplier', newSupplier)
        .catch(error => {
            console.error('Error adding supplier:', error);
            throw error;
        });
};

// Функція для видалення продукту
export const deleteProduct = (productId: number) => {
    return api.delete(`/product/${productId}`)
        .catch(error => {
            console.error('Error deleting product:', error);
            throw error;
        });
};

// Функція для додавання продукту
export const addProduct = (newProduct: INewProduct) => {
    return api.post('/product', newProduct)
        .catch(error => {
            console.error('Error adding product:', error);
            throw error;
        });
};

export const addNewCategory = (name: string) => {

    return api.post('/categories', {name: name}).catch(error => {
        console.error('Error adding category:', error);
        throw error;
    });
}

// Функція для оновлення продукту
export const updateProduct = (productId: number, editProduct: IEditProduct) => {
    console.log(editProduct);
    return api.put(`/product/${productId}`, editProduct)
        .catch(error => {
            console.error('Error updating product:', error);
            throw error;
        });
};

// Функція для додавання покупки
export const addPurchase = (productId: number, purchaseData: IPurchaseData) => {
    return api.post(`/product/${productId}/purchase`, purchaseData)
        .catch(error => {
            console.error('Error adding purchase:', error);
            throw error;
        });
};

// Функція для реєстрації продажу
export const addSale = (productId: number, saleData: ISaleData) => {
    return api.post(`/product/${productId}/sale`, saleData)
        .catch(error => {
            console.error('Error adding sale:', error);
            throw error;
        });
};

// Функція для отримання списку постачальників
export const fetchGetAllSuppliers = () => {
    return api.get('/suppliers')  // Припустимо, що API-метод для отримання постачальників - це '/suppliers'
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching suppliers:', error);
            return [];
        });
};

// Функція для отримання історії закупівель постачальника
export const fetchGetSupplierPurchaseHistory = (supplierId) => {
    return api.get(`/supplier/${supplierId}/purchase-history`)
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching purchase history for supplier ${supplierId}:`, error);
            return {
                purchase_history: [],
                products: []
            };
        });
};


// Функція для отримання списку продуктів постачальника
export const fetchGetSupplierProducts = (supplierId) => {
    return api.get(`/supplier/${supplierId}/products`)
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching products for supplier ${supplierId}:`, error);
            return {
                products: []
            };
        });
};


// Запит для створення нового покупця
export const createCustomer = (customerData: ICustomerDetails): Promise<ICustomer> => {
    return api.post('/customers', customerData)
        .then(response => response.data as ICustomer)
        .catch((error: AxiosError) => {
            console.error('Error creating customer:', error);
            return Promise.reject(error); // Явно вказуємо, що в разі помилки повертається відхилений Promise
        });
};


// Запит для отримання списку всіх покупців
export const fetchGetAllCustomers = () => {
    return api.get('/customers')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching customers:', error);
            return [];
        });
};

// Запит для отримання інформації про конкретного покупця
export const fetchCustomerDetails = (customerId) => {
    return api.get(`/customers/${customerId}`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching customer details:', error);
            throw error;
        });
};

