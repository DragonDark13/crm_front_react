import React, {useState} from 'react';
import {Button, DialogActions, DialogContent, TextField} from "@mui/material";
import CustomDialog from "../CustomDialog/CustomDialog";
import axios from "axios";

interface ICreateNewCategoryModal {
    openCategoryCreateModal: boolean;
    handleCloseCategoryModal: () => void;
}

const CreateNewCategoryModal = ({openCategoryCreateModal,handleCloseCategoryModal}:ICreateNewCategoryModal) => {

    const [categoryName, setCategoryName] = useState('');

    const createCategory = () => {
        axios.post('http://localhost:5000/api/categories', {name: categoryName})
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error creating category', error);
            });
    };


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
                <Button variant="contained" color="primary" onClick={createCategory}>
                    Створити категорію
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateNewCategoryModal;
