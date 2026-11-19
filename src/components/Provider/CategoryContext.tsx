import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo, useRef} from 'react';
import {fetchGetAllCategories} from "../../api/_categories";

// Типізація категорій
interface ICategory {
  id: number;
  name: string;
}

// Типізація для контексту
interface CategoryContextProps {
  categories: ICategory[];
  fetchCategoriesFunc: () => Promise<boolean>;
}

// Створення контексту
const CategoryContext = createContext<CategoryContextProps | undefined>(undefined);

// Створення Провайдера
export const CategoryProvider: React.FC<PropsWithChildren> = ({ children }:PropsWithChildren) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchCategoriesFunc = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) return false;

    const requestId = ++requestIdRef.current;

    try {
      const data = await fetchGetAllCategories();

      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return false;
      }

      if (Array.isArray(data)) {
        setCategories(data);
        return true;
      }
      throw new Error('Fetched data is not an array');
    } catch (error) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return false;
      }

      console.error('Error fetching categories', error);
      return false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void fetchCategoriesFunc();

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [fetchCategoriesFunc]);

  const contextValue = useMemo(() => ({
    categories,
    fetchCategoriesFunc
  }), [categories, fetchCategoriesFunc]);

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

// Хук для зручного доступу до контексту категорій
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
