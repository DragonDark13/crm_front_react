import React, {useState} from "react";
import {Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {addSupplier} from "../../api/api";
import {INewSupplier} from "../../utils/types";

interface AddSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    handleAddSupplier: (newSupplier: INewSupplier) => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({open, handleClose, handleAddSupplier}) => {
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [error, setError] = useState<string | null>(null);


    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Додати нового постачальника</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Назва Постачальника"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!error}
                    helperText={error}
                />
                <TextField
                    margin="dense"
                    label="Контактна інформація"
                    fullWidth
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Відміна
                </Button>

                <Button onClick={() => {
                    const newSupplier: INewSupplier = {
                        name: name,
                        contact_info: contactInfo
                    }
                    handleAddSupplier(newSupplier)
                }} color="primary" variant="contained">
                    Зберігти постачальника
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSupplierModal;
