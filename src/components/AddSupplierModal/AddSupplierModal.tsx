import React, {useState} from "react";
import {Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import axios from "axios";
import {addSupplier} from "../../api/api";

interface AddSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    fetchSuppliersFunc: () => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({open, handleClose, fetchSuppliersFunc}) => {
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAddSupplier = () => {
        const newSupplier = {name, contact_info: contactInfo};

        addSupplier(newSupplier)
            .then(() => {
                fetchSuppliersFunc(); // Оновити список постачальників після додавання
                handleClose(); // Закрити модальне вікно після успішного додавання
            })
            .catch((error) => {
                setError('Error adding supplier: ' + error.message);
            });
    };
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Supplier Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <TextField
                    margin="dense"
                    label="Contact Info"
                    fullWidth
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleAddSupplier} color="primary" variant="contained">
                    Add Supplier
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSupplierModal;
