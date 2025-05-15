import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';
import React, {useState} from 'react';
import {axiosInstance} from "../../../../api/api";
import CustomDialog from "../../CustomDialog/CustomDialog";
import CancelButton from "../../../Buttons/CancelButton";
import {AddPackagingSupplierDialogProps} from "../../../../utils/types";


const AddPackagingSupplierDialog = ({
                                        openAddSupplier,
                                        handleCloseAddSupplier,
                                        isAuthenticated=false
                                    }: AddPackagingSupplierDialogProps) => {
    const [name, setName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            await axiosInstance.post("/add_new_packaging_suppliers", {
                name,
                contact_info: contactInfo,
            });
            handleCloseAddSupplier(); // Закриваємо діалог після успішного додавання
        } catch (err: any) {
            setError(err.response?.data?.error || "Сталася помилка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomDialog
            maxWidth={"xs"}
            open={openAddSupplier}
            handleClose={handleCloseAddSupplier}
            title="Додати постачальника"
        >
            <DialogContent>
                <TextField
                    size={"small"}
                    label="Назва постачальника"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    size={"small"}
                    label="Контактна інформація"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                {error && (
                    <Typography color="error" variant="body2" mb={2}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>

                <CancelButton onClick={handleCloseAddSupplier}/>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || !isAuthenticated}
                >
                    {loading ? <CircularProgress size={24}/> : "Додати"}
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddPackagingSupplierDialog;
