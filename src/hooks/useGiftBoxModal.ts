import {useState} from "react";
import {AxiosError} from "axios";
import {useSnackbarMessage} from "../components/Provider/SnackbarMessageContext";
import {GiftSetPayload, IHandleAddNewGiftBox, ModalNames} from "../utils/types";
import {useGiftSet} from "../components/Provider/GiftSetContext";
import {useModalState} from "./useModalState";

type ModalState = Record<'addNewGiftBox', boolean>;

export const useGiftBoxModal = (
    modalNames: ModalNames[],
    fetchProductsFunc: () => void,
    fetchPackagingOptions: () => void
) => {
    const {modalState, open, close} = useModalState(modalNames);
    const {showSnackbarMessage} = useSnackbarMessage();
    const {createNewGiftSet} = useGiftSet();


    const handleAddNewGiftBox = async (giftBox: IHandleAddNewGiftBox) => {
        if (!giftBox.name.trim()) {
            showSnackbarMessage('The gift set must have a name.', 'warning');
            return;
        }

        if (giftBox.selectedProducts.length === 0 && giftBox.selectedPackaging.length === 0) {
            showSnackbarMessage('The gift set must contain at least one product or packaging.', 'warning');
            return;
        }

        const payload: GiftSetPayload = {
            name: giftBox.name,
            description: giftBox.description,
            gift_selling_price: giftBox.price,
            items: [
                ...giftBox.selectedProducts.map(item => ({
                    item_id: item.item_id,
                    item_type: "product" as const,
                    quantity: item.quantity,
                })),
                ...giftBox.selectedPackaging.map(item => ({
                    item_id: item.item_id,
                    item_type: "packaging" as const,
                    quantity: item.quantity,
                })),
            ],
        };

        try {
            await createNewGiftSet(payload);
            close("addNewGiftBox");
            fetchProductsFunc();
            fetchPackagingOptions();
            showSnackbarMessage("Gift box created successfully!", "success");
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error creating gift box:', axiosError);
            showSnackbarMessage(
                'Error creating gift box: ' + (axiosError.response?.data?.message || axiosError.message),
                'error'
            );
        }
    };

    return {
        modalState,
        handleModalOpen: open,
        handleModalClose: close,
        handleAddNewGiftBox,
    };
};
