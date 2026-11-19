import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo, useRef} from 'react';
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
    const requestIdRef = useRef(0);
    const isMountedRef = useRef(true);

    const fetchGetAllCustomersFunc = useCallback(async (): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            const data = await fetchGetAllCustomers();

            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            if (Array.isArray(data)) {
                setCustomers(data);
                return true;
            }
            throw new Error('Fetched data is not an array');
        } catch (error) {
            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            console.error('Error fetching customers:', error);
            return false;
        } finally {
            if (isMountedRef.current && requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    const createCustomerFunc = useCallback(async (newCustomerData: ICustomerDetailForCreate): Promise<void> => {
        const response = await createCustomer(newCustomerData);

        if (!isMountedRef.current) return;

        setCustomers(prevCustomers => [...prevCustomers, response.customer]);
        showSnackbarMessage('Customer created successfully!', 'success');

        const refreshed = await fetchGetAllCustomersFunc();
        if (!refreshed && isMountedRef.current) {
            showSnackbarMessage('Customer was created, but the customer list could not be refreshed.', 'warning');
        }
    }, [fetchGetAllCustomersFunc, showSnackbarMessage]);

    useEffect(() => {
        isMountedRef.current = true;
        void fetchGetAllCustomersFunc();

        return () => {
            isMountedRef.current = false;
            requestIdRef.current += 1;
        };
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
