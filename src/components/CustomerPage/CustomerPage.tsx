import React, {useEffect, useState} from 'react';
import {createCustomer, fetchGetAllCustomers, fetchCustomerDetails} from '../../api/api';
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


    // Отримуємо список покупців при завантаженні компоненту
    // useEffect(() => {
    //     fetchGetAllCustomers()
    //         .then(customers => setCustomers(customers))
    //         .catch(error => {
    //             console.error('Error fetching customers:', error);
    //         });
    // }, []);

    // Функція для отримання деталей покупця
    const handleGetCustomerDetails = (customerId: number) => {
        fetchCustomerDetails(customerId)
            .then(response => {
                if (response && response.data) {
                    setSelectedCustomer(response.data); // Витягуємо дані з AxiosResponse
                } else {
                    setSelectedCustomer(null); // Якщо відповідь порожня
                }
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer, index) => (
                            <React.Fragment key={customer.id + customer.name}>
                                <TableRow onClick={() => handleGetCustomerDetails(customer.id)}>
                                    <TableCell>{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone_number}</TableCell>
                                </TableRow>
                                {/* Якщо покупець обраний, відображаємо акордеон з додатковою інформацією */}
                                {selectedCustomer && selectedCustomer.id === customer.id && (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Accordion expanded={true}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon/>}
                                                >
                                                    <Typography>Purchase History</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    {selectedCustomer.sales && selectedCustomer.sales.length > 0 ? (
                                                        <ul>
                                                            {selectedCustomer.sales.map((sale) => (
                                                                <li key={sale.id}>
                                                                    {sale.product} - {sale.quantity_sold} units sold
                                                                    at {sale.selling_price_per_item} per item
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <Typography>No sales history available.</Typography>
                                                    )}
                                                </AccordionDetails>
                                            </Accordion>
                                        </TableCell>
                                    </TableRow>
                                )}
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
        </div>
    );
};

export default CustomerPage;
