import {Button, DialogActions, DialogContent, TextField} from "@mui/material";
import CustomDialog from "../CustomDialog/CustomDialog";
import React, {useState} from "react";

interface ICreateNewCategoryModal {
    openCategoryCreateModal: boolean;
    handleCloseCategoryModal: () => void;
    createNewCategory: (categoryName: string) => void;
}

const CreateNewCategoryModal = ({
                                    openCategoryCreateModal,
                                    handleCloseCategoryModal,
                                    createNewCategory
                                }: ICreateNewCategoryModal) => {

    const [categoryName, setCategoryName] = useState<string>('');

    // Обробник натискання Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Запобігає стандартній поведінці, якщо потрібно
            createNewCategory(categoryName);
        }
    };


    return (
        <CustomDialog
            open={openCategoryCreateModal}
            handleClose={handleCloseCategoryModal}
            title="Добадавання нової Категорії"
            maxWidth="xs"
        >
            <DialogContent>
                <TextField
                    fullWidth
                    label="Назва категорії"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyDown={handleKeyDown} // Додаємо обробник для Enter
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseCategoryModal} color="primary">
                    Відміна
                </Button>
                <Button variant="contained" color="primary" onClick={() => createNewCategory(categoryName)}>
                    Зберігти категорію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateNewCategoryModal;
