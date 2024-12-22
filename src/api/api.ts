import axios, {AxiosError} from 'axios';
import {ICustomer, ICustomerDetails, IEditProduct, INewProduct, IPurchaseData, ISaleData} from "../utils/types";


// Створення екземпляра axios з правильним типом конфігурації

console.log(import.meta.env.MODE);
const api = axios.create();

api.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json';

// const fakeResponse = {
//     data: [
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 1,
//             "name": "Палочка Воландеморта",
//             "purchase_price_per_item": 507.6,
//             "purchase_total_price": 507.6,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 1,
//                 "name": "skladoptom.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 2,
//             "name": "Палочка Грюма",
//             "purchase_price_per_item": 507.6,
//             "purchase_total_price": 507.6,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 1,
//                 "name": "skladoptom.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 3,
//             "name": "Брелок с гербом Пуффендуя",
//             "purchase_price_per_item": 65.49,
//             "purchase_total_price": 65.49,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 1,
//                 "name": "skladoptom.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 4,
//             "name": "Брелок с гербом Когтевран",
//             "purchase_price_per_item": 86,
//             "purchase_total_price": 86,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 5,
//             "name": "Брелок Дары Смерти",
//             "purchase_price_per_item": 81,
//             "purchase_total_price": 81,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 6,
//             "name": "Брелок Грифиндор круглый",
//             "purchase_price_per_item": 333.33333333333337,
//             "purchase_total_price": 1000,
//             "quantity": 0,
//             "selling_price_per_item": 500,
//             "selling_quantity": 3,
//             "selling_total_price": 500,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 7,
//             "name": "Брелок Слизерин круглый",
//             "purchase_price_per_item": 60,
//             "purchase_total_price": 60,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 8,
//             "name": "Брелок Когтевран круглый",
//             "purchase_price_per_item": 60,
//             "purchase_total_price": 60,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 9,
//             "name": "Брелок Пуфендуй круглый",
//             "purchase_price_per_item": 60,
//             "purchase_total_price": 60,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 10,
//             "name": "Брелок Хогвартс круглый",
//             "purchase_price_per_item": 0,
//             "purchase_total_price": 0,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 11,
//             "name": "Светильник Сова",
//             "purchase_price_per_item": 390,
//             "purchase_total_price": 390,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 2,
//                 "name": "misteria.prom.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 12,
//             "name": "Сервиз чайный Хогвартс",
//             "purchase_price_per_item": 3800,
//             "purchase_total_price": 3800,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 3,
//                 "name": "Настя @tykkinykki"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 13,
//             "name": "Шарф Гриффиндор",
//             "purchase_price_per_item": 900,
//             "purchase_total_price": 900,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 4,
//                 "name": "Татьяна Явтуховская"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 14,
//             "name": "Чашка с молнией",
//             "purchase_price_per_item": 165,
//             "purchase_total_price": 165,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 5,
//                 "name": "starsandsky.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 15,
//             "name": "Чашка с гербом Хогвартса",
//             "purchase_price_per_item": 165,
//             "purchase_total_price": 165,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 5,
//                 "name": "starsandsky.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 16,
//             "name": "Чашка с оленем",
//             "purchase_price_per_item": 165,
//             "purchase_total_price": 165,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 5,
//                 "name": "starsandsky.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 17,
//             "name": "Чашка с совой",
//             "purchase_price_per_item": 135,
//             "purchase_total_price": 135,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 5,
//                 "name": "starsandsky.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 18,
//             "name": "Чашка с башней",
//             "purchase_price_per_item": 135,
//             "purchase_total_price": 135,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 5,
//                 "name": "starsandsky.com.ua"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 19,
//             "name": "Мешочки тканевые 23х17",
//             "purchase_price_per_item": 23,
//             "purchase_total_price": 92,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 6,
//                 "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 20,
//             "name": "Мешочки тканевые 13х10",
//             "purchase_price_per_item": 10,
//             "purchase_total_price": 100,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 6,
//                 "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
//             }
//         },
//         {
//             "category_ids": [],
//             "created_date": "Sun, 06 Oct 2024 14:56:51 GMT",
//             "id": 21,
//             "name": "Мешочки тканевые 10х8",
//             "purchase_price_per_item": 8,
//             "purchase_total_price": 120,
//             "quantity": 0,
//             "selling_price_per_item": 0,
//             "selling_quantity": 0,
//             "selling_total_price": 0,
//             "supplier": {
//                 "contact_info": null,
//                 "id": 6,
//                 "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
//             }
//         }
//     ]
// };

// const fakeCategory = {
//     data: [
//         {
//             "id": 1,
//             "name": "Сувеніри"
//         },
//         {
//             "id": 2,
//             "name": "Гаррі Поттер"
//         },
//         {
//             "id": 3,
//             "name": "Володар Перснів"
//         }
//     ]
// }


// const fakeResponseSuppliers = {
//     data: [
//         {
//             "contact_info": null,
//             "id": 1,
//             "name": "skladoptom.com.ua"
//         },
//         {
//             "contact_info": null,
//             "id": 2,
//             "name": "misteria.prom.ua"
//         },
//         {
//             "contact_info": null,
//             "id": 3,
//             "name": "Настя @tykkinykki"
//         },
//         {
//             "contact_info": null,
//             "id": 4,
//             "name": "Татьяна Явтуховская"
//         },
//         {
//             "contact_info": null,
//             "id": 5,
//             "name": "starsandsky.com.ua"
//         },
//         {
//             "contact_info": null,
//             "id": 6,
//             "name": "https://prom.ua/ua/c2798198-gsl-internet-magazin.html"
//         }
//     ]
// }


// api.interceptors.request.use((config) => {
//     // Перевіряємо, чи це production середовище
//     if (import.meta.env.MODE === 'production') {
//         // Перевіряємо URL запиту
//         if (config.url === '/products') {
//             // Фейкові дані, які будемо повертати
//             return new Promise((resolve) => {
//                 setTimeout(() => {
//                     config.adapter = () => Promise.resolve({
//                         data: fakeResponse.data,
//                         status: 200,
//                         statusText: 'OK',
//                         headers: {},
//                         config: config
//                     });
//                     resolve(config);
//                 }, 500); // Затримка у 500 мс для імітації реального запиту
//             });
//         }
//
//         if (config.url === '/categories') {
//             return new Promise((resolve) => {
//                 setTimeout(() => {
//                     config.adapter = () => Promise.resolve({
//                         data: fakeCategory.data,
//                         status: 200,
//                         statusText: 'OK',
//                         headers: {},
//                         config: config
//                     });
//                     resolve(config);
//                 }, 500);
//             });
//         }
//
//         if (config.url === '/suppliers') {
//             return new Promise((resolve) => {
//                 setTimeout(() => {
//                     config.adapter = () => Promise.resolve({
//                         data: fakeResponseSuppliers.data,
//                         status: 200,
//                         statusText: 'OK',
//                         headers: {},
//                         config: config
//                     });
//                     resolve(config);
//                 }, 500);
//             });
//         }
//     }
//
//     // Повертаємо конфігурацію для всіх інших запитів або у режимі розробки
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

