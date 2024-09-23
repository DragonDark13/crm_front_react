import axios, { CreateAxiosDefaults } from 'axios';


// Створення екземпляра axios з правильним типом конфігурації
const api = axios.create();

api.defaults.baseURL='http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json';


// Функція для отримання списку продуктів
export const fetchProducts = () => {
    return api.get('/products')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching products:', error);
            throw error; // Можна передавати помилку для обробки в компонентах
        });
};

// Функція для видалення продукту
export const deleteProduct = (productId) => {
    return api.delete(`/product/${productId}`)
        .catch(error => {
            console.error('Error deleting product:', error);
            throw error;
        });
};

// Функція для додавання продукту
export const addProduct = (newProduct) => {
    return api.post('/product', newProduct)
        .catch(error => {
            console.error('Error adding product:', error);
            throw error;
        });
};

// Функція для оновлення продукту
export const updateProduct = (productId, editProduct) => {
    return api.put(`/product/${productId}`, editProduct)
        .catch(error => {
            console.error('Error updating product:', error);
            throw error;
        });
};

// Функція для додавання покупки
export const addPurchase = (productId, purchaseData) => {
    return api.post(`/product/${productId}/purchase`, purchaseData)
        .catch(error => {
            console.error('Error adding purchase:', error);
            throw error;
        });
};

// Функція для реєстрації продажу
export const addSale = (productId, saleData) => {
    return api.post(`/product/${productId}/sale`, saleData)
        .catch(error => {
            console.error('Error adding sale:', error);
            throw error;
        });
};
