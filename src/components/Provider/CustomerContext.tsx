import React, {createContext, useState, useContext, useEffect} from 'react';
import {fetchAllCustomers} from "../../api/api";

// Типізація клієнтів
interface ICustomer {
    id: number;
    name: string;
    email: string;
}

// Типізація для контексту
interface CustomerContextProps {
    customers: ICustomer[];
    fetchCustomersFunc: () => void;
}

// Створення контексту
const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

// Створення Провайдера
export const CustomerProvider: React.FC = ({children}) => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);

    const fetchCustomersFunc = async () => {
        try {
            const data = await fetchAllCustomers();
            if (Array.isArray(data)) {
                setCustomers(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        fetchCustomersFunc();
    }, []);

    return (
        <CustomerContext.Provider value={{customers, fetchCustomersFunc}}>
            {children}
        </CustomerContext.Provider>
    );
};

// Хук для зручного доступу до контексту клієнтів
export const useCustomers = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
