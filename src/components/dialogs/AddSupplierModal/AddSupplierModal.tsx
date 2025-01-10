import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button} from '@mui/material';

interface INewSupplier {
    name: string;
    contact_info: string;
}

interface AddSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    handleAddSupplier: (supplier: INewSupplier) => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({open, handleClose, handleAddSupplier}) => {
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        if (!name.trim()) {
            setError('Назва постачальника обов\'язкова');
            return false;
        } else if (name.trim().length < 10) {
            setError('Назва постачальника повинна містит не менше 10 символів');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSave = () => {
        if (!validate()) {
            return;
        }
        const newSupplier = {name, contact_info: contactInfo, email, phone_number: phoneNumber, address};

        handleAddSupplier(newSupplier);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Додати нового постачальника</DialogTitle>
            <DialogContent>
                <TextField
                    minLength={10}
                    maxLength={100}
                    required={true}
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
                <TextField
                    margin="dense"
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Телефон"
                    fullWidth
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Адреса"
                    fullWidth
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Відміна
                </Button>

                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={!name.trim()} // Кнопка неактивна, якщо поле порожнє
                >
                    Зберегти постачальника
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddSupplierModal;
