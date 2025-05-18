import {INewSupplier, ISupplierFull} from "../../../utils/types";
import React, {useEffect, useState} from "react";
import CustomDialog from "../CustomDialog/CustomDialog";
import {Button, DialogActions, DialogContent, TextField} from "@mui/material";
import CancelButton from "../../Buttons/CancelButton";

interface EditSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    handleEditSupplier: (supplier: INewSupplier) => void;
    supplier: ISupplierFull;
    isAuthenticated:boolean
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({open, handleClose, handleEditSupplier, supplier,isAuthenticated}) => {


    const [name, setName] = useState(supplier?.name || '');
    const [contactInfo, setContactInfo] = useState(supplier?.contact_info || '');
    const [email, setEmail] = useState(supplier?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(supplier?.phone_number || '');
    const [address, setAddress] = useState(supplier?.address || '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (supplier) {
            setName(supplier.name);
            setContactInfo(supplier.contact_info);
            setEmail(supplier.email);
            setPhoneNumber(supplier.phone_number);
            setAddress(supplier.address);
            setError(null);

        }
    }, [supplier]);

    const validate = () => {
        if (!name.trim()) {
            setError('Назва постачальника обов\'язкова');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;

        const updatedSupplier: { address: string; name: string; phone_number: string; contact_info: string; email: string } = {
            name,
            contact_info: contactInfo,
            email,
            phone_number: phoneNumber,
            address
        };
        handleEditSupplier(updatedSupplier);
    };

    return (
        <CustomDialog title={'Редагувати постачальника'} handleClose={handleClose} open={open}>

            <DialogContent>
                <TextField
                    minLength={10}
                    maxLength={100}
                    required
                    autoFocus
                    margin="dense"
                    label="Назва постачальника"
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
                <CancelButton onClick={handleClose}/>
                {/*<Button onClick={handleClose} color="primary">Відміна</Button>*/}
                <Button disabled={!isAuthenticated} onClick={handleSave} color="primary" variant="contained">Зберегти</Button>
            </DialogActions>
        </CustomDialog>

    );
};

export default EditSupplierModal