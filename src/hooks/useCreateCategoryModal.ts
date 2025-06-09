import {useCategories} from "../components/Provider/CategoryContext";
import {useSnackbarMessage} from "../components/Provider/SnackbarMessageContext";
import {addNewCategory} from "../api/_categories";
import {useState} from "react";
import {ICategory, ModalNames} from "../utils/types";
import {useModalState} from "./useModalState";


export const useCreateCategoryModal = (
    modalNames: ModalNames[],
) => {
    const {modalState, open, close} = useModalState(modalNames);


    const {fetchCategoriesFunc} = useCategories();
    const {showSnackbarMessage} = useSnackbarMessage();


    const createNewCategory = (
        categoryName: string,
        onSuccess?: (newCategory: ICategory) => void // <== Додаємо колбек
    ) => {
        addNewCategory(categoryName)
            .then((newCategory) => {
                fetchCategoriesFunc();
                close('openCategoryCreate');
                showSnackbarMessage('Category added successfully!', 'success');

                if (onSuccess) {
                    onSuccess(newCategory.category); // передаємо створену категорію назад
                }
            })
            .catch(error => {
                showSnackbarMessage('Failed to add the Category!', 'error');
                console.error('There was an error adding the category!', error);
            });
    };

    return {
        modalState,
        handleCategoryModalClose: close,
        handleCategoryModalOpen: open,
        createNewCategory
    };
};
