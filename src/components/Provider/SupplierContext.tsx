import React, {createContext, useState, useContext, useEffect} from 'react';
import {ISupplierFull} from "../../utils/types";
import {fetchGetAllSuppliers, updateSupplier} from "../../api/_supplier";
import {useSnackbarMessage} from "./SnackbarMessageContext";

// Типізація постачальників
// interface ISupplier {
//   id: number;
//   name: string;
// }

// Типізація для контексту
interface SupplierContextProps {
    suppliers: ISupplierFull[];
    fetchSuppliersFunc: () => void;
    handleToggleSupplierActive: (supplierId: number,
                                 currentData: ISupplierFull) => void;
}

// Створення контексту
const SupplierContext = createContext<SupplierContextProps | undefined>(undefined);

// Створення Провайдера
export const SupplierProvider: React.FC = ({children}) => {
    const [suppliers, setSuppliers] = useState<ISupplierFull[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage()

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

    const handleToggleSupplierActive = async (
        supplierId: number,
        currentData: ISupplierFull
    ) => {
        try {
            const updatedData = {
                ...currentData,
                is_active: !currentData.is_active, // інвертуємо активність
            };

            await updateSupplier(supplierId, updatedData);
            showSnackbarMessage(
                updatedData.is_active ? 'Постачальника активовано' : 'Постачальника вимкнено',
                'success'
            );

            await fetchSuppliersFunc(); // оновити список постачальників
        } catch (err) {
            showSnackbarMessage('Помилка зміни статусу постачальника', 'error');
        }
    };

    useEffect(() => {
        fetchSuppliersFunc();
    }, []);


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
