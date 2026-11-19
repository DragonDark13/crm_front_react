import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo} from 'react';
import {ICustomer, ICustomerDetailForCreate} from "../../utils/types";
import {useSnackbarMessage} from "./SnackbarMessageContext";
import {createCustomer, fetchGetAllCustomers} from "../../api/_customer";

interface CustomerContextProps {
    customers: ICustomer[];
    fetchGetAllCustomersFunc: () => Promise<boolean>;
    createCustomerFunc: (newCustomerData: ICustomerDetailForCreate) => Promise<void>;
    loading: boolean;
}

const CustomerContext = createContext<CustomerContextProps | undefined>(undefined);

export const CustomerProvider: React.FC<PropsWithChildren> = ({children}:PropsWithChildren) => {
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const {showSnackbarMessage} = useSnackbarMessage();

    const fetchGetAllCustomersFunc = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            const data = await fetchGetAllCustomers();
            if (Array.isArray(data)) {
                setCustomers(data);
                return true;
            }
            throw new Error('Fetched data is not an array');
        } catch (error) {
            console.error('Error fetching customers:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomerFunc = useCallback(async (newCustomerData: ICustomerDetailForCreate): Promise<void> => {
        const newCustomer = await createCustomer(newCustomerData);
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
        showSnackbarMessage('Customer created successfully!', 'success');
        const refreshed = await fetchGetAllCustomersFunc();
        if (!refreshed) {
            showSnackbarMessage('Customer was created, but the customer list could not be refreshed.', 'warning');
        }
    }, [fetchGetAllCustomersFunc, showSnackbarMessage]);

    useEffect(() => {
        void fetchGetAllCustomersFunc();
    }, [fetchGetAllCustomersFunc]);

    const contextValue = useMemo(() => ({
        customers,
        fetchGetAllCustomersFunc,
        createCustomerFunc,
        loading
    }), [customers, fetchGetAllCustomersFunc, createCustomerFunc, loading]);

    return (
        <CustomerContext.Provider value={contextValue}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomers = () => {
    const context = useContext(CustomerContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
