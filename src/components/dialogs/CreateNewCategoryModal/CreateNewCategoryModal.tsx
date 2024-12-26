import {Button, DialogActions, DialogContent, TextField, Typography} from "@mui/material";
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
    const [error, setError] = useState<string>(''); // Стан для повідомлення про помилку

    // Обробник натискання Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Запобігає стандартній поведінці, якщо потрібно
            handleSave();
        }
    };

    // Функція для збереження категорії
    const handleSave = () => {
        if (categoryName.trim().length < 5) {
            setError('Назва категорії повинна містити не менше 5 символів.');
            return;
        }
        createNewCategory(categoryName);
        setCategoryName(''); // Очищення після створення
        setError(''); // Скидаємо повідомлення про помилку
    };

    return (
        <CustomDialog
            open={openCategoryCreateModal}
            handleClose={handleCloseCategoryModal}
            title="Додавання нової Категорії"
            maxWidth="xs"
        >
            <DialogContent>
                <TextField
                    fullWidth
                    label="Назва категорії"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    onKeyDown={handleKeyDown} // Додаємо обробник для Enter
                    error={!!error} // Відображаємо стан помилки
                    helperText={error} // Текст помилки
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseCategoryModal} color="primary">
                    Відміна
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave} // Виклик функції збереження
                    disabled={categoryName.trim().length < 5} // Деактивація кнопки, якщо назва занадто коротка
                >
                    Зберегти категорію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateNewCategoryModal;
