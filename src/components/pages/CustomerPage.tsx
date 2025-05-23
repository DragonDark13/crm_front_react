import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button,
    Typography, IconButton, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useCustomers} from "../Provider/CustomerContext";
import {ICustomerDetails} from "../../utils/types";
import AddNewCustomerDialog from "../dialogs/CustomersDialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {AxiosError} from "axios";
import {useAuth} from "../context/AuthContext";
import CustomerDetailsDialog from "../dialogs/CustomersDialogs/CustomerDetailsDialog/CustomerDetailsDialog";
import EditCustomerDialog from "../dialogs/CustomersDialogs/EditCustomerDialog/EditCustomerDialog";
import {
    createCustomer,
    deleteCustomerData,
    fetchCustomerDetails,
    fetchGetAllCustomers,
    updateCustomerData
} from "../../api/_customer";
//TODO перенести у запити у відповідні контексти
import {Visibility, Edit, Delete} from "@mui/icons-material";

const CustomerPage: React.FC = () => {
    const {showSnackbarMessage} = useSnackbarMessage()
    const {customers, fetchGetAllCustomersFunc, createCustomerFunc} = useCustomers();
    const [openAddNewCustomerDialog, setOpenAddNewCustomerDialog] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState<ICustomerDetails>({
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        address: '',
    });
    const {isAuthenticated} = useAuth();

    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<ICustomerDetails | null>(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);





    // Функція для відкриття деталей клієнта
    const handleViewDetails = (customerId: number) => {
        fetchCustomerDetails(customerId)
            .then(response => {
                if (response && response) {
                    setSelectedCustomerDetails(response);
                    setOpenDetailsDialog(true);
                }
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
                showSnackbarMessage('Error fetching customer details.', 'error');
            });
    };

    // Функція для створення нового покупця
    const handleCreateCustomer = (newCustomerData: ICustomerDetails) => {


        createCustomerFunc(newCustomerData).then(() => {
            setOpenAddNewCustomerDialog(false);
        }).catch((error: AxiosError) => {
            showSnackbarMessage('Error creating customer: ' + error.response.data.error, 'error')
            console.error('Error creating customer:', error);
        })

    };

    // Відкриття модального вікна
    const handleOpenModal = () => {
        setOpenAddNewCustomerDialog(true);
    };

    // Закриття модального вікна
    const handleCloseAddNewCustomerDialog = () => {
        setOpenAddNewCustomerDialog(false);
    };

    // Функція для обробки змін у полях форми
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCustomerData({
            ...newCustomerData,
            [e.target.name]: e.target.value,
        });
    };

    // Функція для закриття модального вікна
    const handleCloseDetailsDialog = () => {
        setOpenDetailsDialog(false);
        setSelectedCustomerDetails(null);
    };

    const [openEditCustomerDialog, setOpenEditCustomerDialog] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<ICustomerDetails | null>(null);

    const handleEditCustomer = (customerData: ICustomerDetails) => {
        // Логіка для редагування клієнта
        updateCustomerData(customerData).then(() => {
            fetchGetAllCustomersFunc()
            setOpenEditCustomerDialog(false);
            showSnackbarMessage('Customer updated successfully!', 'success');
        }).catch((error: AxiosError) => {
            showSnackbarMessage('Error updating customer: ' + error.response.data.error, 'error');
            console.error('Error updating customer:', error);
        })


    };

    const handleOpenEditModal = (customer: ICustomerDetails) => {
        setCustomerToEdit(customer);
        setOpenEditCustomerDialog(true);
    };

    const handleDeleteCustomer = (customerId: number) => {
        deleteCustomerData(customerId).then(() => {
            fetchGetAllCustomersFunc()
            showSnackbarMessage('Customer deleted successfully!', 'success');
        }).catch((error: AxiosError) => {
            showSnackbarMessage('Error deleting customer: ' + error.response.data.error, 'error');
            console.error('Error deleting customer:', error);
        })


    };

    return (
        <div>
            <Button  variant="contained" color="primary" onClick={handleOpenModal}>
                Додати нового Кліента
            </Button>

            {/* Таблиця з переліком усіх покупців */}
            <TableContainer component={Paper} style={{marginTop: '20px'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography variant="subtitle2">Ім'я</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Єлектронна пошта</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Телефонний номер</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2">Address</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" align={"right"}>Дії</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.length > 0 ? customers.map((customer) => (
                                <React.Fragment key={customer.id + customer.name}>
                                    <TableRow
                                              >
                                        <TableCell size={"small"}><Typography
                                            variant="subtitle2">{customer.name}</Typography></TableCell>
                                        <TableCell size={"small"}><Typography
                                            variant="subtitle2">{customer.email}</Typography></TableCell>
                                        <TableCell size={"small"}>
                                            <Typography
                                                variant="subtitle2">{customer.phone_number}</Typography></TableCell>
                                        <TableCell size={"small"}><Typography
                                            variant="subtitle2">{customer.address}</Typography></TableCell>
                                        <TableCell align={"right"} size={"small"}>
                                            <Tooltip title="Деталі">
                                                <IconButton color="info" onClick={() => handleViewDetails(customer.id)}>
                                                    <Visibility/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Редагувати">
                                                <IconButton color="primary" onClick={() => handleOpenEditModal(customer)}>
                                                    <Edit/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <IconButton color="secondary"
                                                            onClick={() => handleDeleteCustomer(customer.id)}>
                                                    <Delete/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                            :
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography variant="subtitle2">Немає покупців</Typography>
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальне вікно для додавання нового покупця */}
            <AddNewCustomerDialog
                isAuthenticated={isAuthenticated}
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
                openAddNewCustomerDialog={openAddNewCustomerDialog}
                handleCloseAddNewCustomerDialog={handleCloseAddNewCustomerDialog}
                handleAddCustomer={handleCreateCustomer}/>

            <CustomerDetailsDialog
                open={openDetailsDialog}
                customer={selectedCustomerDetails}
                handleClose={handleCloseDetailsDialog}
            />

            {/* Модальне вікно для редагування клієнта */}
            <EditCustomerDialog
                handleEditCustomer={handleEditCustomer}
                handleCloseEditCustomerDialog={() => setOpenEditCustomerDialog(false)}
                openEditCustomerDialog={openEditCustomerDialog}
                customerToEdit={customerToEdit}
                setCustomerToEdit={setCustomerToEdit}
            />
        </div>
    );
};

export default CustomerPage;
