// hooks/useSupplierModal.ts
import {useState} from 'react';
import {INewSupplier, ISupplierID, ModalNames} from "../utils/types";
import {useSnackbarMessage} from "../components/Provider/SnackbarMessageContext";
import {useSuppliers} from "../components/Provider/SupplierContext";
import {addSupplier} from "../api/_supplier";




export const useSupplierModal = <T extends ISupplierID>(
    modalNames: ModalNames[],
    editProduct: T,
    setEditProduct: (val: T) => void
) => {
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );

    const {fetchSuppliersFunc} = useSuppliers();
    const {showSnackbarMessage} = useSnackbarMessage();

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prev => ({...prev, [modal]: true}));
    };

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prev => ({...prev, [modal]: false}));
    };

    const handleAddSupplier = (newSupplier: INewSupplier) => {
        addSupplier(newSupplier)
            .then((response) => {
                handleModalClose("openAddSupplierOpen");
                fetchSuppliersFunc();

                setEditProduct({
                    ...editProduct,
                    supplier_id: response.supplier_id,
                });

                showSnackbarMessage('Supplier completed successfully!', 'success');
            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbarMessage('There was an error saving the supplier!', 'error');
            });
    };

    return {
        modalState,
        handleModalOpen,
        handleModalClose,
        handleAddSupplier,
    };
};
