import {INewSupplier, ISupplierFull, ISupplierType} from "../../../utils/types";
import React, {useEffect, useState} from "react";
import CustomDialog from "../CustomDialog/CustomDialog";
import {Button, DialogActions, DialogContent, FormControlLabel, Switch, TextField} from "@mui/material";
import CancelButton from "../../Buttons/CancelButton";

interface EditSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    handleEditSupplier: (supplier: INewSupplier, type: ISupplierType) => void;
    supplier: ISupplierFull;
    isAuthenticated: boolean
}


const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
    open,
    handleClose,
    handleEditSupplier,
    supplier,
    isAuthenticated
}) => {
    const [name, setName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [initialSupplierState, setInitialSupplierState] = useState({
        name: '',
        contact_info: '',
        email: '',
        phone_number: '',
        address: '',
        is_active: true
    });

    useEffect(() => {
        if (supplier) {
            const initialState = {
                name: supplier.name || '',
                contact_info: supplier.contact_info || '',
                email: supplier.email || '',
                phone_number: supplier.phone_number || '',
                address: supplier.address || '',
                is_active: supplier.is_active ?? true
            };

            setInitialSupplierState(initialState);
            setName(initialState.name);
            setContactInfo(initialState.contact_info);
            setEmail(initialState.email);
            setPhoneNumber(initialState.phone_number);
            setAddress(initialState.address);
            setIsActive(initialState.is_active);
            setError(null);
        }
    }, [supplier]);

    const validate = () => {
        if (!name.trim()) {
            setError("Назва постачальника обов'язкова");
            return false;
        }
        setError(null);
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;

        const updatedSupplier = {
            name,
            contact_info: contactInfo,
            email,
            phone_number: phoneNumber,
            address,
            is_active: isActive
        };

        handleEditSupplier(updatedSupplier, supplier.type);
    };

    const isDisabled = supplier && !supplier.is_active;

    const hasChanges = (
        name !== initialSupplierState.name ||
        contactInfo !== initialSupplierState.contact_info ||
        email !== initialSupplierState.email ||
        phoneNumber !== initialSupplierState.phone_number ||
        address !== initialSupplierState.address ||
        isActive !== initialSupplierState.is_active
    );

    return (
        <CustomDialog title={'Редагувати постачальника'} handleClose={handleClose} open={open}>
            <DialogContent>
                <TextField
                    size="small"
                    required
                    autoFocus
                    margin="dense"
                    label="Назва постачальника"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!error}
                    helperText={error}
                    disabled={isDisabled}
                />
                <TextField
                    size="small"
                    margin="dense"
                    label="Контактна інформація"
                    fullWidth
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    disabled={isDisabled}
                />
                <TextField
                    size="small"
                    margin="dense"
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isDisabled}
                />
                <TextField
                    size="small"
                    margin="dense"
                    label="Телефон"
                    fullWidth
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isDisabled}
                />
                <TextField
                    size="small"
                    margin="dense"
                    label="Адреса"
                    fullWidth
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isDisabled}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                        />
                    }
                    label={isActive ? "Активний" : "Неактивний"}
                    sx={{ mt: 2 }}
                />
            </DialogContent>

            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button
                    disabled={!isAuthenticated || !hasChanges}
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                >
                    Зберегти
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default EditSupplierModal