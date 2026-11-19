import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo, useRef} from 'react';
import {IProduct} from "../../utils/types";
import {fetchProducts} from "../../api/_product";
import {useAuth} from '../context/AuthContext';

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
  const {authReady, isAuthenticated} = useAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadingState, setLoadingState] = useState<{ isLoading: boolean, error: string | null }>({
    isLoading: true,
    error: null,
  });
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchProductsFunc = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) return false;

    const requestId = ++requestIdRef.current;

    try {
      setLoadingState({ isLoading: true, error: null });
      const data = await fetchProducts();

      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return false;
      }

      if (Array.isArray(data)) {
        setProducts(data);
        setLoadingState({ isLoading: false, error: null });
        return true;
      }

      throw new Error('Fetched data is not an array');
    } catch (_error) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return false;
      }

      setLoadingState({ isLoading: false, error: 'There was an error fetching the products!' });
      return false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (authReady && isAuthenticated) void fetchProductsFunc();

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [fetchProductsFunc, authReady, isAuthenticated]);

  const contextValue = useMemo(
    () => ({ products, fetchProductsFunc, loadingState }),
    [products, fetchProductsFunc, loadingState]
  );

  return (
    <ProductContext.Provider value={contextValue}>
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
