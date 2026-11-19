import React, {createContext, useState, useContext, useEffect, PropsWithChildren, useCallback, useMemo, useRef} from 'react';
import {fetchGiftSets, removeGiftSet, createGiftBox, updateGiftSet, sellGiftSet} from '../../api/_giftBox.ts';
import {GiftSetPayload, IGiftSet, IGiftUpdateItem} from "../../utils/types";
import {useSnackbarMessage} from "./SnackbarMessageContext";

interface GiftSetContextProps {
    giftSets: IGiftSet[];
    setGiftSets: React.Dispatch<React.SetStateAction<IGiftSet[]>>;
    fetchGiftSetsData: () => Promise<boolean>;
    deleteGiftSet: (giftSetId: number) => Promise<boolean>;
    createNewGiftSet: (newGiftBox: GiftSetPayload) => Promise<boolean>;
    updateExistingGiftSet: (updatedGiftBox: IGiftUpdateItem) => Promise<boolean>;
    sellGiftSetData: (requestData: { gift_set_id: number; customer_id: number; sale_date: string | null; selling_price: number }) => Promise<boolean>;
}

const GiftSetContext = createContext<GiftSetContextProps | undefined>(undefined);

export const GiftSetProvider: React.FC<PropsWithChildren> = ({children}:PropsWithChildren) => {
    const [giftSets, setGiftSets] = useState<IGiftSet[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();
    const requestIdRef = useRef(0);
    const isMountedRef = useRef(true);

    const fetchGiftSetsData = useCallback(async (): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        const requestId = ++requestIdRef.current;

        try {
            const data = await fetchGiftSets();

            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            setGiftSets(data);
            return true;
        } catch (error) {
            if (!isMountedRef.current || requestId !== requestIdRef.current) {
                return false;
            }

            console.error("Error fetching gift sets:", error);
            showSnackbarMessage('Помилка отримання наборів', 'error');
            return false;
        }
    }, [showSnackbarMessage]);

    const deleteGiftSet = useCallback(async (giftSetId: number): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
            await removeGiftSet(giftSetId);
            if (!isMountedRef.current) return false;

            requestIdRef.current += 1;
            setGiftSets(prevSets => prevSets.filter(giftSet => giftSet.id !== giftSetId));
            showSnackbarMessage('Gift set removed successfully', 'success');
            return true;
        } catch (error) {
            if (!isMountedRef.current) return false;

            console.error("Error deleting gift set:", error);
            showSnackbarMessage('Помилка видалення набору', 'error');
            return false;
        }
    }, [showSnackbarMessage]);

    const createNewGiftSet = useCallback(async (newGiftBox: GiftSetPayload): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
            await createGiftBox(newGiftBox);
            if (!isMountedRef.current) return false;

            await fetchGiftSetsData();
            if (!isMountedRef.current) return false;

            showSnackbarMessage('Gift set created successfully', 'success');
            return true;
        } catch (error) {
            if (!isMountedRef.current) return false;

            console.error("Error creating gift box:", error);
            showSnackbarMessage('Помилка створення набору', 'error');
            return false;
        }
    }, [fetchGiftSetsData, showSnackbarMessage]);

    const updateExistingGiftSet = useCallback(async (updatedGiftBox: IGiftUpdateItem): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
            await updateGiftSet(updatedGiftBox);
            if (!isMountedRef.current) return false;

            await fetchGiftSetsData();
            if (!isMountedRef.current) return false;

            showSnackbarMessage('Gift set updated successfully', 'success');
            return true;
        } catch (error) {
            if (!isMountedRef.current) return false;

            console.error("Error updating gift set:", error);
            showSnackbarMessage('Помилка оновлення набору', 'error');
            return false;
        }
    }, [fetchGiftSetsData, showSnackbarMessage]);

    const sellGiftSetData = useCallback(async (requestData: { gift_set_id: number; customer_id: number; sale_date: string | null; selling_price: number }): Promise<boolean> => {
        if (!isMountedRef.current) return false;

        try {
            await sellGiftSet(requestData);
            if (!isMountedRef.current) return false;

            await fetchGiftSetsData();
            if (!isMountedRef.current) return false;

            showSnackbarMessage('Gift set sold successfully', 'success');
            return true;
        } catch (error) {
            if (!isMountedRef.current) return false;

            console.error("Error selling gift set:", error);
            showSnackbarMessage('Помилка продажу набору', 'error');
            return false;
        }
    }, [fetchGiftSetsData, showSnackbarMessage]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            requestIdRef.current += 1;
        };
    }, []);

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
