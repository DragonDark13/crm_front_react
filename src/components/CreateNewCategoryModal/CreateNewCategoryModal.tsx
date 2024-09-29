import {Button, DialogActions, DialogContent, TextField} from "@mui/material";
import CustomDialog from "../CustomDialog/CustomDialog";
import {useState} from "react";

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


    return (
        <CustomDialog
            open={openCategoryCreateModal}
            handleClose={handleCloseCategoryModal}
            title="Add New Category"
            maxWidth="xs"
        >
            <DialogContent>
                <TextField
                    label="Назва категорії"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseCategoryModal} color="primary">
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={() => createNewCategory(categoryName)}>
                    Створити категорію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateNewCategoryModal;
