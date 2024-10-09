import React, { createContext, useState, useContext, useEffect } from 'react';
import {fetchGetAllSuppliers} from "../../api/api";

// Типізація постачальників
interface ISupplier {
  id: number;
  name: string;
}

// Типізація для контексту
interface SupplierContextProps {
  suppliers: ISupplier[];
  fetchSuppliersFunc: () => void;
}

// Створення контексту
const SupplierContext = createContext<SupplierContextProps | undefined>(undefined);

// Створення Провайдера
export const SupplierProvider: React.FC = ({ children }) => {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);

  const fetchSuppliersFunc = async () => {
    try {
      const data = await fetchGetAllSuppliers();
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        throw new Error('Fetched data is not an array');
      }
    } catch (error) {
      console.error('Error fetching suppliers', error);
    }
  };

  useEffect(() => {
    fetchSuppliersFunc();
  }, []);

  return (
    <SupplierContext.Provider value={{ suppliers, fetchSuppliersFunc }}>
      {children}
    </SupplierContext.Provider>
  );
};

// Хук для зручного доступу до контексту постачальників
export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
