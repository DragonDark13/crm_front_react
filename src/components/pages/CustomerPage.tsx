import React, {useEffect, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useCustomers} from "../Provider/CustomerContext";
import {ICustomerDetails} from "../../utils/types";
import AddNewCustomerDialog from "../dialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {AxiosError} from "axios";
import {useAuth} from "../context/AuthContext";
import CustomerDetailsDialog from "../dialogs/CustomerDetailsDialog/CustomerDetailsDialog";
import EditCustomerDialog from "../dialogs/EditCustomerDialog/EditCustomerDialog";
import {
    createCustomer,
    deleteCustomerData,
    fetchCustomerDetails,
    fetchGetAllCustomers,
    updateCustomerData
} from "../../api/_customer";
//TODO перенести у запити у відповідні контексти


const CustomerPage: React.FC = () => {
    const {showSnackbarMessage} = useSnackbarMessage()
    const {customers} = useCustomers();
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerDetails | null>(null);
    const [openAddNewCustomerDialog, setOpenAddNewCustomerDialog] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState<ICustomerDetails>({
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        address: '',
    });
    const {isAuthenticated,} = useAuth();

    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<ICustomerDetails | null>(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);


    // Отримуємо список покупців при завантаженні компоненту
    // useEffect(() => {
    //     fetchGetAllCustomers()
    //         .then(customers => setCustomers(customers))
    //         .catch(error => {
    //             console.error('Error fetching customers:', error);
    //         });
    // }, []);

    // Функція для отримання деталей покупця
    const handleGetCustomerDetails = (customer: ICustomerDetails) => {
        setSelectedCustomer(customer); // Починаємо з пустого стану
        fetchCustomerDetails(customer.id)
            .then(response => {
                if (response && response) {
                    setSelectedCustomer(response); // Витягуємо дані з AxiosResponse
                } else {
                    setSelectedCustomer(null); // Якщо відповідь порожня
                }
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
            });
    };

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
        createCustomer(newCustomerData)
            .then(response => {
                console.log('Response:', response); // Лог для перевірки відповіді


                setOpenAddNewCustomerDialog(false);
                fetchGetAllCustomers()
                showSnackbarMessage('Customer created successfully!', 'success')


                // Закриваємо модальне вікно після створення
            })
            .catch((error: AxiosError) => {
                console.log('Error Response:', error.response); // Лог для перевірки помилки

                showSnackbarMessage('Error creating customer: ' + error.response.data.error, 'error')
                console.error('Error creating customer:', error);
            });
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
        updateCustomerData(customerData); // Викликаємо API для оновлення клієнта
        setOpenEditCustomerDialog(false);
        showSnackbarMessage('Customer updated successfully!', 'success');
    };

    const handleOpenEditModal = (customer: ICustomerDetails) => {
        setCustomerToEdit(customer);
        setOpenEditCustomerDialog(true);
    };

    const handleDeleteCustomer = (customerId: number) => {
        deleteCustomerData(customerId); // Викликаємо API для видалення клієнта
        showSnackbarMessage('Customer deleted successfully!', 'success');
    };

    return (
        <div>
            <Button disabled={!isAuthenticated} variant="contained" color="primary" onClick={handleOpenModal}>
                Додати нового Кліента
            </Button>

            {/* Таблиця з переліком усіх покупців */}
            <TableContainer component={Paper} style={{marginTop: '20px'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ім'я</TableCell>
                            <TableCell>Єлектронна пошта</TableCell>
                            <TableCell>Телефонний номер</TableCell>
                            <TableCell>Address</TableCell> {/* Додаємо колонку для адреси */}

                            <TableCell>Дії</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer, index) => (
                            <React.Fragment key={customer.id + customer.name}>
                                <TableRow hover selected={selectedCustomer && selectedCustomer?.id === customer.id}
                                          onClick={
                                              () => handleGetCustomerDetails(customer)
                                          }>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone_number}</TableCell>
                                    <TableCell>{customer.address}</TableCell>

                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            onClick={() => handleViewDetails(customer.id)}
                                        >
                                            Деталі
                                        </Button>
                                        <Button onClick={() => handleOpenEditModal(customer)} color="primary">
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteCustomer(customer.id)}
                                            color="secondary"
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {/* Якщо покупець обраний, відображаємо акордеон з додатковою інформацією */}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальне вікно для додавання нового покупця */}
            <AddNewCustomerDialog
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
