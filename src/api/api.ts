import axios, {CreateAxiosDefaults} from 'axios';


// Створення екземпляра axios з правильним типом конфігурації
const api = axios.create();

api.defaults.baseURL = 'http://localhost:5000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Інтерцептор для фейкових даних
// Інтерцептор для обробки запитів
api.interceptors.request.use((config) => {
  // Перевіряємо URL запиту
  if (config.url === '/products') {
    // "Фейкові" дані, які будемо повертати
    const fakeResponse = {
      data: [
        { id: 1, name: 'Product 1', supplier: 'Supplier 1', quantity: 100 },
        { id: 2, name: 'Product 2', supplier: 'Supplier 2', quantity: 50 }
      ]
    };

    // Перехоплюємо запит і відправляємо фейкову відповідь
    return new Promise((resolve) => {
      setTimeout(() => {
        // Емуляція асинхронної відповіді з фейковими даними
        config.adapter = () => Promise.resolve({
          data: fakeResponse.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config
        });
        resolve(config);
      }, 500); // Затримка у 500 мс для імітації реального запиту
    });
  }

  // Повертаємо конфігурацію для всіх інших запитів
  return config;
}, (error) => {
  return Promise.reject(error);
});



// Функція для отримання списку продуктів
export const fetchProducts = () => {
    return api.get('/products')
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching products:', error);
             return [];
        });
};

export const  fetchGetAllCategories = ()=>{
    return api.get('/categories')
       .then(response => response.data)
       .catch(error => {
            console.error('Error fetching categories:', error);
            return [];
        });
}

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


