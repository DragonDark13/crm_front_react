import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo, useRef} from 'react';
import {ISupplierFull, ISupplierType} from "../../utils/types";
import {fetchGetAllSuppliers, updateSupplier} from "../../api/_supplier";
import {useSnackbarMessage} from "./SnackbarMessageContext";
import {updatePackagingSupplier} from "../../api/_packagingMaterials";
import {runCrudAction} from "../../utils/runCrudAction";

// Типізація постачальників
// interface ISupplier {
//   id: number;
//   name: string;
// }

// Типізація для контексту
interface SupplierContextProps {
    suppliers: ISupplierFull[];
    fetchSuppliersFunc: () => Promise<boolean>;
    handleToggleSupplierActive: (supplierId: number,
                                 currentData: ISupplierFull, type: ISupplierType) => void;
}

// Створення контексту
const SupplierContext = createContext<SupplierContextProps | undefined>(undefined);

// Створення Провайдера
export const SupplierProvider: React.FC<PropsWithChildren> = ({children}:PropsWithChildren) => {
    const [suppliers, setSuppliers] = useState<ISupplierFull[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();
    const requestIdRef = useRef(0);
    const isMountedRef = useRef(true);

    const fetchSuppliersFunc = useCallback(async (): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        const requestId = ++requestIdRef.current;

        try {
            const data = await fetchGetAllSuppliers();

            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            if (Array.isArray(data)) {
                setSuppliers(data);
                return true;
            }
            throw new Error('Fetched data is not an array');
        } catch (error) {
            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            console.error('Error fetching suppliers', error);
            return false;
        }
    }, []);

    const handleToggleSupplierActive = useCallback(async (
        supplierId: number,
        currentData: ISupplierFull,
        type: ISupplierType
    ) => {
        if (!isMountedRef.current) return;

        const updatedData = {
            ...currentData,
            is_active: !currentData.is_active,
        };

        await runCrudAction(
            async () => {
                if (type === 'product') {
                    return updateSupplier(supplierId, updatedData);
                }
                return updatePackagingSupplier(supplierId, updatedData);
            },
            fetchSuppliersFunc,
            {
                onSuccess: () => {
                    if (isMountedRef.current) {
                        showSnackbarMessage(
                            updatedData.is_active ? 'Постачальника активовано' : 'Постачальника вимкнено',
                            'success'
                        );
                    }
                },
                onError: () => {
                    if (isMountedRef.current) {
                        showSnackbarMessage('Помилка зміни статусу постачальника', 'error');
                    }
                },
                onRefreshError: () => {
                    if (isMountedRef.current) {
                        showSnackbarMessage('Статус постачальника змінено, але список не вдалося оновити.', 'warning');
                    }
                }
            }
        );
    }, [fetchSuppliersFunc, showSnackbarMessage]);

    useEffect(() => {
        isMountedRef.current = true;
        void fetchSuppliersFunc();

        return () => {
            isMountedRef.current = false;
            requestIdRef.current += 1;
        };
    }, [fetchSuppliersFunc]);

    const contextValue = useMemo(
        () => ({suppliers, fetchSuppliersFunc, handleToggleSupplierActive}),
        [suppliers, fetchSuppliersFunc, handleToggleSupplierActive]
    );

    return (
        <SupplierContext.Provider value={contextValue}>
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
