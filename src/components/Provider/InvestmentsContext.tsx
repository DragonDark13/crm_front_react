import React, {createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef} from "react";
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
    fetchInvestments: (notifyError?: boolean, signal?: AbortSignal) => Promise<boolean>;
    handleAddInvestment: () => Promise<void>;
    handleDeleteInvestment: (id: number) => Promise<void>;
    handleDeleteAllOtherInvestment: (handleClose: () => void) => Promise<void>;
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
    const fetchRequestId = useRef(0);

    const fetchInvestments = useCallback(async (
        notifyError = true,
        signal?: AbortSignal
    ): Promise<boolean> => {
        const requestId = ++fetchRequestId.current;

        try {
            const data = await getAllInvestments(signal);

            if (signal?.aborted || requestId !== fetchRequestId.current) {
                return false;
            }

            setInvestments(data);
            return true;
        } catch (error) {
            if (signal?.aborted || requestId !== fetchRequestId.current) {
                return false;
            }

            if (notifyError) {
                showSnackbarMessage("Помилка завантаження інвестицій", "error");
            }
            return false;
        }
    }, [showSnackbarMessage]);

    const resetNewInvestmentDialog = useCallback(() => {
        setNewInvestment({
            type_name: "",
            cost: 0,
            date: new Date().toISOString().slice(0, 10),
            supplier: ""
        });
    }, []);

    const handleAddInvestment = useCallback(async () => {
        try {
            await createInvestment(newInvestment);
            const refreshed = await fetchInvestments(false);
            setAddInvestDialogOpen(false);
            resetNewInvestmentDialog();
            showSnackbarMessage("Інвестицію додано", "success");
            if (!refreshed) {
                showSnackbarMessage("Інвестицію додано, але список не вдалося оновити.", "warning");
            }
        } catch (error) {
            showSnackbarMessage("Помилка додавання інвестиції", "error");
        }
    }, [newInvestment, fetchInvestments, resetNewInvestmentDialog, showSnackbarMessage]);

    const handleDeleteInvestment = useCallback(async (id: number) => {
        try {
            await deleteInvestmentById(id);
            const refreshed = await fetchInvestments(false);
            showSnackbarMessage("Інвестицію видалено", "success");
            if (!refreshed) {
                showSnackbarMessage("Запис видалено, але список не вдалося оновити.", "warning");
            }
        } catch (error) {
            showSnackbarMessage("Помилка видалення інвестиції", "error");
        }
    }, [fetchInvestments, showSnackbarMessage]);

    const handleAddInvestmentClose = useCallback(() => {
        resetNewInvestmentDialog();
        setAddInvestDialogOpen(false);
    }, [resetNewInvestmentDialog]);

    const handleDeleteAllOtherInvestment = useCallback(async (handleClose: () => void) => {
        try {
            await deleteAllInvestments();
            const refreshed = await fetchInvestments(false);
            showSnackbarMessage('Всі записи успішно видалені', 'success');
            if (!refreshed) {
                showSnackbarMessage('Записи видалено, але список не вдалося оновити.', 'warning');
            }
            handleClose();
        } catch (error: unknown) {
            console.error('Помилка під час видалення:', error);
            showSnackbarMessage('Сталася помилка під час видалення.', 'error');
        }
    }, [fetchInvestments, showSnackbarMessage]);

    useEffect(() => {
        const controller = new AbortController();

        void fetchInvestments(true, controller.signal);

        return () => {
            controller.abort();
            fetchRequestId.current += 1;
        };
    }, [fetchInvestments]);

    const contextValue = useMemo(() => ({
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
    }), [
        investments,
        newInvestment,
        addInvestDialogOpen,
        fetchInvestments,
        handleAddInvestment,
        handleDeleteInvestment,
        handleDeleteAllOtherInvestment,
        handleAddInvestmentClose
    ]);

    return (
        <InvestmentsContext.Provider value={contextValue}>
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
