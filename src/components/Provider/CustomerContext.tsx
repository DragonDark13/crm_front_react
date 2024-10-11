import React, {createContext, useState, useContext, useEffect} from 'react';
import {createCustomer, fetchGetAllCustomers} from "../../api/api";
import {ICustomerDetails} from "../../utils/types";
import {AxiosError} from "axios";
import {useSnackbarMessage} from "./SnackbarMessageContext";

// Типізація клієнтів
interface ICustomer {
    id: number;
    name: string;
    email: string;
    address: string;
    phone_number: string;
}

// Типізація для контексту
interface CustomerContextProps {
    customers: ICustomer[];
    fetchCustomersFunc: () => void;
    createCustomerFunc: (newCustomerData: ICustomerDetails) => Promise<void>; // Додаємо функцію для створення
}

// Створення контексту
const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

// Створення Провайдера
export const CustomerProvider: React.FC = ({children}) => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
        const {showSnackbarMessage} = useSnackbarMessage()


    const fetchGetAllCustomersFunc = async () => {
        try {
            const data = await fetchGetAllCustomers();
            if (Array.isArray(data)) {
                setCustomers(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

     const createCustomerFunc = async (newCustomerData: ICustomerDetails) => {
        try {
            const newCustomer = await createCustomer(newCustomerData);
            setCustomers(prevCustomers => [...prevCustomers, newCustomer]); // Додаємо нового клієнта в список
            showSnackbarMessage('Customer created successfully!', 'success');
        } catch (error: AxiosError) {
            console.error('Error creating customer:', error);
            showSnackbarMessage('Error creating customer: ' + error.response?.data?.error || 'Unknown error', 'error');
        }
    };

    useEffect(() => {
        fetchGetAllCustomersFunc();
    }, []);

    return (
        <CustomerContext.Provider value={{customers, fetchCustomersFunc: fetchGetAllCustomersFunc, createCustomerFunc}}>
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
