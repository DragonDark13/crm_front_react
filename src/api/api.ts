import axios from 'axios';
import {IEditProduct, INewProduct, IPurchaseData, ISaleData} from "../utils/types";



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
            "price_per_item": "507.6",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 1,
                "name": "skladoptom.com.ua"
            },
            "total_price": "507.6"
        },
        {
            "category_ids": [],
            "id": 2,
            "name": "Палочка Грюма",
            "price_per_item": "507.6",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 1,
                "name": "skladoptom.com.ua"
            },
            "total_price": "507.6"
        },
        {
            "category_ids": [],
            "id": 3,
            "name": "Брелок с гербом Пуффендуя",
            "price_per_item": "65.49",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 1,
                "name": "skladoptom.com.ua"
            },
            "total_price": "65.49"
        },
        {
            "category_ids": [],
            "id": 4,
            "name": "Брелок с гербом Когтевран",
            "price_per_item": "86",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "86"
        },
        {
            "category_ids": [],
            "id": 5,
            "name": "Брелок Дары Смерти",
            "price_per_item": "81",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "81"
        },
        {
            "category_ids": [],
            "id": 6,
            "name": "Брелок Грифиндор круглый",
            "price_per_item": "60",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "60"
        },
        {
            "category_ids": [],
            "id": 7,
            "name": "Брелок Слизерин круглый",
            "price_per_item": "60",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "60"
        },
        {
            "category_ids": [],
            "id": 8,
            "name": "Брелок Когтевран круглый",
            "price_per_item": "60",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "60"
        },
        {
            "category_ids": [],
            "id": 9,
            "name": "Брелок Пуфендуй круглый",
            "price_per_item": "60",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "60"
        },
        {
            "category_ids": [],
            "id": 10,
            "name": "Брелок Хогвартс круглый",
            "price_per_item": "0",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "0"
        },
        {
            "category_ids": [],
            "id": 11,
            "name": "Светильник Сова",
            "price_per_item": "390",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 2,
                "name": "misteria.prom.ua"
            },
            "total_price": "390"
        },
        {
            "category_ids": [],
            "id": 12,
            "name": "Сервиз чайный Хогвартс",
            "price_per_item": "3800",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 3,
                "name": "Настя @tykkinykki"
            },
            "total_price": "3800"
        },
        {
            "category_ids": [],
            "id": 13,
            "name": "Шарф Гриффиндор",
            "price_per_item": "900",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 4,
                "name": "Татьяна Явтуховская"
            },
            "total_price": "900"
        },
        {
            "category_ids": [],
            "id": 14,
            "name": "Чашка с молнией",
            "price_per_item": "165",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 5,
                "name": "starsandsky.com.ua"
            },
            "total_price": "165"
        },
        {
            "category_ids": [],
            "id": 15,
            "name": "Чашка с гербом Хогвартса",
            "price_per_item": "165",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 5,
                "name": "starsandsky.com.ua"
            },
            "total_price": "165"
        },
        {
            "category_ids": [],
            "id": 16,
            "name": "Чашка с оленем",
            "price_per_item": "165",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 5,
                "name": "starsandsky.com.ua"
            },
            "total_price": "165"
        },
        {
            "category_ids": [],
            "id": 17,
            "name": "Чашка с совой",
            "price_per_item": "135",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 5,
                "name": "starsandsky.com.ua"
            },
            "total_price": "135"
        },
        {
            "category_ids": [],
            "id": 18,
            "name": "Чашка с башней",
            "price_per_item": "135",
            "quantity": 1,
            "supplier": {
                "contact_info": null,
                "id": 5,
                "name": "starsandsky.com.ua"
            },
            "total_price": "135"
        },
        {
            "category_ids": [],
            "id": 19,
            "name": "Мешочки тканевые 23х17",
            "price_per_item": "23",
            "quantity": 4,
            "supplier": {
                "contact_info": null,
                "id": 6,
                "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
            },
            "total_price": "92"
        },
        {
            "category_ids": [],
            "id": 20,
            "name": "Мешочки тканевые 13х10",
            "price_per_item": "10",
            "quantity": 10,
            "supplier": {
                "contact_info": null,
                "id": 6,
                "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
            },
            "total_price": "100"
        },
        {
            "category_ids": [],
            "id": 21,
            "name": "Мешочки тканевые 10х8",
            "price_per_item": "8",
            "quantity": 15,
            "supplier": {
                "contact_info": null,
                "id": 6,
                "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
            },
            "total_price": "120"
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


const fakeResponseSuppliers = {
    data: [
        {
            "contact_info": null,
            "id": 1,
            "name": "skladoptom.com.ua"
        },
        {
            "contact_info": null,
            "id": 2,
            "name": "misteria.prom.ua"
        },
        {
            "contact_info": null,
            "id": 3,
            "name": "Настя @tykkinykki"
        },
        {
            "contact_info": null,
            "id": 4,
            "name": "Татьяна Явтуховская"
        },
        {
            "contact_info": null,
            "id": 5,
            "name": "starsandsky.com.ua"
        },
        {
            "contact_info": null,
            "id": 6,
            "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
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
//     if (config.url === '/suppliers') {
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 config.adapter = () => Promise.resolve({
//                     data: fakeResponseSuppliers.data,
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


