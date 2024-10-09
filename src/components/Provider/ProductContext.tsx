import React, { createContext, useState, useContext, useEffect } from 'react';
import {fetchProducts} from "../../api/api";
import {IProduct} from "../../utils/types";

// Типізація для контексту
interface ProductContextProps {
  products: IProduct[];
  fetchProductsFunc: () => void;
  loadingState: { isLoading: boolean; error: string | null };
}

// Створення контексту
const ProductContext = createContext<ProductContextProps | undefined>(undefined);

// Створення Провайдера
export const ProductProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadingState, setLoadingState] = useState<{ isLoading: boolean, error: string | null }>({
    isLoading: true,
    error: null,
  });

  const fetchProductsFunc = async () => {
    try {
      setLoadingState({ isLoading: true, error: null });
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error('Fetched data is not an array');
      }
    } catch (error) {
      setLoadingState({ isLoading: false, error: 'There was an error fetching the products!' });
    } finally {
      setLoadingState({ isLoading: false, error: null });
    }
  };

  useEffect(() => {
    fetchProductsFunc();
  }, []);

  return (
    <ProductContext.Provider value={{ products, fetchProductsFunc, loadingState }}>
      {children}
    </ProductContext.Provider>
  );
};

// Хук для зручного доступу до контексту продуктів
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
