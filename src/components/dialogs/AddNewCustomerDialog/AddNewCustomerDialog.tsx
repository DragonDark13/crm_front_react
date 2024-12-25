import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {ICustomerDetails} from "../../../utils/types";


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
        <Dialog open={openAddNewCustomerDialog} onClose={handleCloseAddNewCustomerDialog}>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogContent>
                <TextField
                    required
                    autoFocus
                    margin="dense"
                    name="name"
                    label="Name"
                    type="text"
                    fullWidth
                    value={newCustomerData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}  // Встановлюємо статус помилки
                    helperText={errors.name}  // Виводимо текст помилки
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
                    label="Phone Number"
                    type="text"
                    fullWidth
                    value={newCustomerData.phone_number}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="address"
                    label="Address"
                    type="text"
                    fullWidth
                    value={newCustomerData.address}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAddNewCustomerDialog} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleCreate} color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddNewCustomerDialog;
