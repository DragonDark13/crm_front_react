import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback} from 'react';
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
    const {showSnackbarMessage} = useSnackbarMessage()

    const fetchSuppliersFunc = useCallback(async (): Promise<boolean> => {
        try {
            const data = await fetchGetAllSuppliers();
            if (Array.isArray(data)) {
                setSuppliers(data);
                return true;
            }
            throw new Error('Fetched data is not an array');
        } catch (error) {
            console.error('Error fetching suppliers', error);
            return false;
        }
    }, []);

    const handleToggleSupplierActive = async (
        supplierId: number,
        currentData: ISupplierFull,
        type: ISupplierType
    ) => {
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
                onSuccess: () => showSnackbarMessage(
                    updatedData.is_active ? 'Постачальника активовано' : 'Постачальника вимкнено',
                    'success'
                ),
                onError: () => showSnackbarMessage('Помилка зміни статусу постачальника', 'error'),
                onRefreshError: () => showSnackbarMessage('Статус постачальника змінено, але список не вдалося оновити.', 'warning')
            }
        );
    };

    useEffect(() => {
        void fetchSuppliersFunc();
    }, [fetchSuppliersFunc]);


    return (
        <SupplierContext.Provider value={{suppliers, fetchSuppliersFunc, handleToggleSupplierActive}}>
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
