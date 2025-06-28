import React, {createContext, useContext, useState, useEffect, ReactNode} from "react";
import {axiosInstance} from "../../api/api";
import {useSnackbarMessage} from "./SnackbarMessageContext";
import {INewInvestment, Investment} from "../../utils/types";
import {
    getAllInvestments,
    createInvestment,
    deleteInvestmentById,
    deleteAllInvestments,
} from '../../api/_investmentsApi.ts';

// Типи

interface InvestmentsContextType {
    investments: Investment[];
    newInvestment: INewInvestment;
    setNewInvestment: React.Dispatch<React.SetStateAction<INewInvestment>>;
    addInvestDialogOpen: boolean;
    setAddInvestDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchInvestments: () => Promise<void>;
    handleAddInvestment: () => Promise<void>;
    handleDeleteInvestment: (id: number) => Promise<void>;
    handleAddInvestmentClose: () => void;
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined);

export const InvestmentsProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [newInvestment, setNewInvestment] = useState<INewInvestment>({
        type_name: "",
        cost: 0,
        date: new Date().toISOString().slice(0, 10),
        supplier: ""
    });
    const [addInvestDialogOpen, setAddInvestDialogOpen] = useState(false);
    const {showSnackbarMessage} = useSnackbarMessage();

    const fetchInvestments = async () => {
        try {
            const data = await getAllInvestments();
            setInvestments(data);
        } catch (error) {
            showSnackbarMessage("Помилка завантаження інвестицій", "error");
        }
    };

    const resetNewInvestmentDialog = () => {
        setNewInvestment({
            type_name: "",
            cost: 0,
            date: new Date().toISOString().slice(0, 10),
            supplier: ""
        });
    };

    const handleAddInvestment = async () => {
        try {
            await createInvestment(newInvestment);
            await fetchInvestments();
            setAddInvestDialogOpen(false);
            resetNewInvestmentDialog();
            showSnackbarMessage("Інвестицію додано", "success");
        } catch (error) {
            showSnackbarMessage("Помилка додавання інвестиції", "error");
        }
    };

    const handleDeleteInvestment = async (id: number) => {
        try {
            await deleteInvestmentById(id);
            // Після видалення можна оновити список:
            await fetchInvestments();
            showSnackbarMessage("Інвестицію видалено", "success");
        } catch (error) {
            showSnackbarMessage("Помилка видалення інвестиції", "error");
        }
    };

    const handleAddInvestmentClose = () => {
        resetNewInvestmentDialog();
        setAddInvestDialogOpen(false);
    };

    const handleDeleteAllOtherInvestment = async (handleClose) => {
        try {
           const res = await deleteAllInvestments();
            await fetchInvestments();
            showSnackbarMessage('Всі записи успішно видалені', 'success');
            handleClose();
        } catch (error: any) {
            console.error('Помилка під час видалення:', error);
            showSnackbarMessage('Сталася помилка під час видалення.', 'error');

        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    return (
        <InvestmentsContext.Provider value={{
            investments,
            newInvestment,
            setNewInvestment,
            addInvestDialogOpen,
            setAddInvestDialogOpen,
            fetchInvestments,
            handleAddInvestment,
            handleDeleteInvestment,
            handleDeleteAllOtherInvestment,
            handleAddInvestmentClose
        }}>
            {children}
        </InvestmentsContext.Provider>
    );
};

export const useInvestments = () => {
    const context = useContext(InvestmentsContext);
    if (!context) {
        throw new Error("useInvestments must be used within an InvestmentsProvider");
    }
    return context;
};
