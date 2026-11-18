import React, {createContext, useState, useContext, useEffect, PropsWithChildren} from 'react';
import {IProduct} from "../../utils/types";
import {fetchProducts} from "../../api/_product";

// Типізація для контексту
interface ProductContextProps {
  products: IProduct[];
  fetchProductsFunc: () => Promise<boolean>;
  loadingState: { isLoading: boolean; error: string | null };
}

// Створення контексту
const ProductContext = createContext<ProductContextProps | undefined>(undefined);

// Створення Провайдера
export const ProductProvider: React.FC<PropsWithChildren> = ({ children }:PropsWithChildren) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadingState, setLoadingState] = useState<{ isLoading: boolean, error: string | null }>({
    isLoading: true,
    error: null,
  });

  const fetchProductsFunc = async (): Promise<boolean> => {
    try {
      setLoadingState({ isLoading: true, error: null });
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setProducts(data);
        setLoadingState({ isLoading: false, error: null });
        return true;
      }
      throw new Error('Fetched data is not an array');
    } catch (error) {
      setLoadingState({ isLoading: false, error: 'There was an error fetching the products!' });
      return false;
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

// Хук для зручного доступу до контексту клієнтів
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
