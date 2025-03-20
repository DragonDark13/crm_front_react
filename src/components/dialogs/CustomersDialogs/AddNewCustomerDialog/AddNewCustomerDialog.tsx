import React, {useState} from 'react';
import {Button,DialogActions, DialogContent, TextField} from "@mui/material";
import {ICustomerDetails} from "../../../../utils/types";
import CustomDialog from "../../CustomDialog/CustomDialog";
import CancelButton from "../../../Buttons/CancelButton";


export interface IAddNewCustomerDialog {
    openAddNewCustomerDialog: boolean;
    handleCloseAddNewCustomerDialog: () => void;
    handleAddCustomer: (newCustomer: ICustomerDetails) => void;
    newCustomerData: ICustomerDetails;
    setNewCustomerData: (data: ICustomerDetails) => void;
}

const AddNewCustomerDialog = ({
                                  handleAddCustomer,
                                  handleCloseAddNewCustomerDialog,
                                  openAddNewCustomerDialog,
                                  setNewCustomerData,
                                  newCustomerData
                              }: IAddNewCustomerDialog) => {


    const [errors, setErrors] = useState<{ name?: string, email?: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomerData({
            ...newCustomerData,
            [e.target.name]: e.target.value,
        });

        // Очищуємо помилку, якщо користувач почав вводити ім'я
        if (e.target.name === "name" && e.target.value.trim() !== '') {
            setErrors((prevErrors) => ({...prevErrors, name: undefined}));
        }
    };

    const handleCreate = () => {
        if (newCustomerData.name.trim() === '') {
            setErrors({name: 'Name is required'});
            return; // зупиняємо процес створення, якщо ім'я порожнє
        }


        handleAddCustomer(newCustomerData);
    };

    return (
        <CustomDialog
            open={openAddNewCustomerDialog}
            title="Додати нового покупця"
            handleClose={handleCloseAddNewCustomerDialog}
        >
            <DialogContent>
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Ім'я"
                    type="text"
                    fullWidth
                    value={newCustomerData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                />
                <TextField
                    margin="dense"
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={newCustomerData.email}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="phone_number"
                    label="Номер телефону"
                    type="text"
                    fullWidth
                    value={newCustomerData.phone_number}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="address"
                    label="Адреса"
                    type="text"
                    fullWidth
                    value={newCustomerData.address}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>

                <CancelButton onClick={handleCloseAddNewCustomerDialog}

                />
                <Button variant="contained" onClick={handleCreate} >
                    Створити
                </Button>
            </DialogActions>
        </CustomDialog>);
};

export default AddNewCustomerDialog;
