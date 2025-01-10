import React, { createContext, useState, useContext, useEffect } from 'react';
import {fetchGetAllCategories} from "../../api/_categories";

// Типізація категорій
interface ICategory {
  id: number;
  name: string;
}

// Типізація для контексту
interface CategoryContextProps {
  categories: ICategory[];
  fetchCategoriesFunc: () => void;
}

// Створення контексту
const CategoryContext = createContext<CategoryContextProps | undefined>(undefined);

// Створення Провайдера
export const CategoryProvider: React.FC = ({ children }) => {
  const [categories, setCategories] = useState<ICategory[]>([]);

  const fetchCategoriesFunc = async () => {
    try {
      const data = await fetchGetAllCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        throw new Error('Fetched data is not an array');
      }
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  useEffect(() => {
    fetchCategoriesFunc();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategoriesFunc }}>
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
