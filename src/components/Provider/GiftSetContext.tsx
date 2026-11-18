import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo} from 'react';
import {fetchGiftSets, removeGiftSet, createGiftBox, updateGiftSet, sellGiftSet} from '../../api/_giftBox.ts'; // Import
// your API
// functions


import {GiftSetPayload, IGiftSet, IGiftUpdateItem} from "../../utils/types";
import {useSnackbarMessage} from "./SnackbarMessageContext"; // Assuming you have this function

interface GiftSetContextProps {
    giftSets: IGiftSet[];
    setGiftSets: React.Dispatch<React.SetStateAction<IGiftSet[]>>;
    fetchGiftSetsData: () => void;
    deleteGiftSet: (giftSetId: number) => void;
    createNewGiftSet: (newGiftBox: GiftSetPayload) => void;
    updateExistingGiftSet: (updatedGiftBox: IGiftUpdateItem) => void;
    sellGiftSetData: (requestData: { gift_set_id: number; customer_id: number; sale_date: string | null; selling_price: number }) => void;
}

const GiftSetContext = createContext<GiftSetContextProps | undefined>(undefined);

export const GiftSetProvider: React.FC<PropsWithChildren> = ({children}:PropsWithChildren) => {
    const [giftSets, setGiftSets] = useState<IGiftSet[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();


    const fetchGiftSetsData = useCallback(() => {
        fetchGiftSets()
            .then(setGiftSets)
            .catch((error) => {
                console.error("Error fetching gift sets:", error);
                showSnackbarMessage('Помилка отримання наборів', 'error');
            });
    }, [showSnackbarMessage]);

    const deleteGiftSet = useCallback((giftSetId: number) => {
        removeGiftSet(giftSetId)
            .then(() => {
                setGiftSets(prevSets => prevSets.filter(giftSet => giftSet.id !== giftSetId));
                showSnackbarMessage('Gift set removed successfully', 'success');
            })
            .catch((error) => {
                console.error("Error deleting gift set:", error);
                showSnackbarMessage('Помилка видалення набору', 'error');
            });
    }, [showSnackbarMessage]);

    const createNewGiftSet = useCallback((newGiftBox: GiftSetPayload) => {
        createGiftBox(newGiftBox)
            .then(() => {
                fetchGiftSetsData(); // Refresh gift sets after creation
                showSnackbarMessage('Gift set created successfully', 'success');
            })
            .catch((error) => {
                console.error("Error creating gift box:", error);
                showSnackbarMessage('Помилка створення набору', 'error');
            });
    }, [fetchGiftSetsData, showSnackbarMessage]);

    const updateExistingGiftSet = useCallback((updatedGiftBox: IGiftUpdateItem) => {
        updateGiftSet(updatedGiftBox)
            .then(() => {
                fetchGiftSetsData(); // Refresh after updating
                showSnackbarMessage('Gift set updated successfully', 'success');
            })
            .catch((error) => {
                console.error("Error updating gift set:", error);
                showSnackbarMessage('Помилка оновлення набору', 'error');
            });
    }, [fetchGiftSetsData, showSnackbarMessage]);

    const sellGiftSetData = useCallback((requestData: { gift_set_id: number; customer_id: number; sale_date: string | null; selling_price: number }) => {
        sellGiftSet(requestData)
            .then(() => {
                fetchGiftSetsData(); // Refresh gift sets after selling
                showSnackbarMessage('Gift set sold successfully', 'success');
            })
            .catch((error) => {
                console.error("Error selling gift set:", error);
                showSnackbarMessage('Помилка продажу набору', 'error');
            });
    }, [fetchGiftSetsData, showSnackbarMessage]);

    const contextValue = useMemo(() => ({
        giftSets,
        setGiftSets,
        fetchGiftSetsData,
        deleteGiftSet,
        createNewGiftSet,
        updateExistingGiftSet,
        sellGiftSetData
    }), [
        giftSets,
        fetchGiftSetsData,
        deleteGiftSet,
        createNewGiftSet,
        updateExistingGiftSet,
        sellGiftSetData
    ]);

    return (
        <GiftSetContext.Provider value={contextValue}>
            {children}
        </GiftSetContext.Provider>
    );
};


export const useGiftSet = (): GiftSetContextProps => {
    const context = useContext(GiftSetContext);
    if (!context) {
        throw new Error("useGiftSet must be used within a GiftSetProvider");
    }
    return context;
};
