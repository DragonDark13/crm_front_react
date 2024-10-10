import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {ICustomerDetails} from "../../../utils/types";


export interface IAddNewCustomerDialog {
    openAddNewCustomerDialog: boolean;
    handleCloseAddNewCustomerDialog: () => void;
    handleAddCustomer: (newCustomer: ICustomerDetails) => void;

}

const AddNewCustomerDialog = ({
                                  handleAddCustomer, handleCloseAddNewCustomerDialog, openAddNewCustomerDialog
                              }: IAddNewCustomerDialog) => {

    const [newCustomerData, setNewCustomerData] = useState<ICustomerDetails>({
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        address: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomerData({
            ...newCustomerData,
            [e.target.name]: e.target.value,
        });
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
                <Button onClick={(e) => handleAddCustomer(newCustomerData)} color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>

    );
};

export default AddNewCustomerDialog;
