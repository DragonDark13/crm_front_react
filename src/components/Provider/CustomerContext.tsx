import React, {createContext, useState, useContext, useEffect, PropsWithChildren} from 'react';
import {ICustomer, ICustomerDetails, INewGiftCustomerDetails} from "../../utils/types";
import axios, {AxiosError} from "axios";
import {useSnackbarMessage} from "./SnackbarMessageContext";
import {createCustomer, fetchGetAllCustomers} from "../../api/_customer";



// Типізація для контексту
interface CustomerContextProps {
    customers: ICustomer[];
    fetchGetAllCustomersFunc: () => void;
    createCustomerFunc: (newCustomerData: INewGiftCustomerDetails) => Promise<void>; // Додаємо функцію для створення
    loading: boolean; // Додаємо поле для перевірки завантаження
}

// Створення контексту
const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

// Створення Провайдера
export const CustomerProvider: React.FC = ({children}:PropsWithChildren) => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState(true); // Стан завантаження
    const {showSnackbarMessage} = useSnackbarMessage()

    const fetchGetAllCustomersFunc = async () => {
        try {
            setLoading(true); // Починаємо завантаження
            const data = await fetchGetAllCustomers();
            if (Array.isArray(data)) {
                setCustomers(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false); // Завершуємо завантаження
        }
    };

    const createCustomerFunc = async (newCustomerData: INewGiftCustomerDetails) => {
        try {
            const newCustomer = await createCustomer(newCustomerData);
            setCustomers(prevCustomers => [...prevCustomers, newCustomer]); // Додаємо нового клієнта в список
            showSnackbarMessage('Customer created successfully!', 'success');
            fetchGetAllCustomersFunc();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                showSnackbarMessage(
                    'Error creating customer: ' +
                    (error.response?.data?.error ?? 'Unknown error'),
                    'error'
                );
            } else {
                showSnackbarMessage('Unknown error', 'error');
            }
        }
    };

    useEffect(() => {
        fetchGetAllCustomersFunc();
    }, []);

    return (
        <CustomerContext.Provider value={{customers, fetchGetAllCustomersFunc: fetchGetAllCustomersFunc, createCustomerFunc, loading}}>
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
