import axios from 'axios';
import {INewProduct, IProduct, IPurchaseData, ISaleData} from "../App";


// Створення екземпляра axios з правильним типом конфігурації
const api = axios.create();

api.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json';

const fakeResponse = {
    data: [
        {
            "category_ids": [],
            "id": 1,
            "name": "Палочка Воландеморта",
            "price_per_item": 507,
            "quantity": 1,
            "supplier": "skladoptom.com.ua",
            "total_price": 507
        },
        {
            "category_ids": [],
            "id": 2,
            "name": "Палочка Грюма",
            "price_per_item": 507,
            "quantity": 1,
            "supplier": "skladoptom.com.ua",
            "total_price": 507
        },
        {
            "category_ids": [],
            "id": 3,
            "name": "Брелок с гербом Пуффендуя",
            "price_per_item": 65,
            "quantity": 1,
            "supplier": "skladoptom.com.ua",
            "total_price": 65
        },
        {
            "category_ids": [
                1,
                2
            ],
            "id": 4,
            "name": "test",
            "price_per_item": 6,
            "quantity": 6,
            "supplier": "еуіе",
            "total_price": 5
        }
    ]
};

const fakeCategory = {
    data: [
        {
            "id": 1,
            "name": "Сувеніри"
        },
        {
            "id": 2,
            "name": "Гаррі Поттер"
        },
        {
            "id": 3,
            "name": "Володар Перснів"
        }
    ]
}

//
// api.interceptors.request.use((config) => {
//     // Перевіряємо URL запиту
//     if (config.url === '/products') {
//         // "Фейкові" дані, які будемо повертати
//
//         // Перехоплюємо запит і відправляємо фейкову відповідь
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 // Емуляція асинхронної відповіді з фейковими даними
//                 config.adapter = () => Promise.resolve({
//                     data: fakeResponse.data,
//                     status: 200,
//                     statusText: 'OK',
//                     headers: {},
//                     config: config
//                 });
//                 resolve(config);
//             }, 500); // Затримка у 500 мс для імітації реального запиту
//         });
//     }
//
//     // Перевіряємо URL запиту для категорій
//     if (config.url === '/categories') {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 config.adapter = () => Promise.resolve({
//                     data: fakeCategory.data,
//                     status: 200,
//                     statusText: 'OK',
//                     headers: {},
//                     config: config
//                 });
//                 resolve(config);
//             }, 500); // Затримка у 500 мс для імітації реального запиту
//         });
//     }
//
//
//     // Повертаємо конфігурацію для всіх інших запитів
//     return config;
// }, (error) => {
//     return Promise.reject(error);
// });


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

// Функція для оновлення продукту
export const updateProduct = (productId: number, editProduct: IProduct) => {
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


