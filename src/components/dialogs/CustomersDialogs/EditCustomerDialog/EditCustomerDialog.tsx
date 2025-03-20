import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {ICustomerDetails} from "../../../../utils/types";
import {useState} from "react";
import CustomDialog from "../../CustomDialog/CustomDialog";

interface IEditCustomerDialog {
    handleEditCustomer: (customerData: ICustomerDetails) => void;
    handleCloseEditCustomerDialog: () => void;
    openEditCustomerDialog: boolean;
    customerToEdit: ICustomerDetails | null;
    setCustomerToEdit: React.Dispatch<React.SetStateAction<ICustomerDetails | null>>;
}

const EditCustomerDialog: React.FC<IEditCustomerDialog> = ({
                                                               handleEditCustomer,
                                                               handleCloseEditCustomerDialog,
                                                               openEditCustomerDialog,
                                                               customerToEdit,
                                                               setCustomerToEdit,
                                                           }) => {
    const [errors, setErrors] = useState<{ name?: string, email?: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerToEdit({
            ...customerToEdit!,
            [e.target.name]: e.target.value,
        });

        // Очищуємо помилку, якщо користувач почав вводити ім'я
        if (e.target.name === "name" && e.target.value.trim() !== '') {
            setErrors((prevErrors) => ({...prevErrors, name: undefined}));
        }
    };

    const handleSave = () => {
        if (customerToEdit?.name.trim() === '') {
            setErrors({name: 'Name is required'});
            return; // зупиняємо процес збереження, якщо ім'я порожнє
        }

        handleEditCustomer(customerToEdit!); // Викликаємо функцію для редагування
    };

    return (
        <CustomDialog
            open={openEditCustomerDialog}
            title="Редагувати клієнта"
            handleClose={handleCloseEditCustomerDialog}
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
                    value={customerToEdit?.name || ''}
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
                    value={customerToEdit?.email || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="phone_number"
                    label="Номер телефону"
                    type="text"
                    fullWidth
                    value={customerToEdit?.phone_number || ''}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="address"
                    label="Адреса"
                    type="text"
                    fullWidth
                    value={customerToEdit?.address || ''}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>
                <Button variant={"contained"} onClick={handleCloseEditCustomerDialog} color="error">
                    Скасувати
                </Button>
                <Button variant={"contained"} onClick={handleSave} color="success">
                    Зберегти
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default EditCustomerDialog