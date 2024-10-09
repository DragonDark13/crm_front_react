import React, { useEffect, useState } from 'react';
import { createCustomer, fetchAllCustomers, fetchCustomerDetails } from '../../api/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField, Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Типи даних для покупців та історії продажів
interface Customer {
    id: number;
    name: string;
    contact_info?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    sales?: SaleHistory[];
}

interface SaleHistory {
    id: number;
    product: string;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    sale_date: string;
}

const CustomerPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState<Customer>({
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        address: '',
    });

    // Отримуємо список покупців при завантаженні компоненту
    useEffect(() => {
        fetchAllCustomers()
            .then(customers => setCustomers(customers))
            .catch(error => {
                console.error('Error fetching customers:', error);
            });
    }, []);

    // Функція для отримання деталей покупця
    const handleGetCustomerDetails = (customerId: number) => {
        fetchCustomerDetails(customerId)
            .then(customer => {
                setSelectedCustomer(customer);
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
            });
    };

    // Функція для створення нового покупця
    const handleCreateCustomer = () => {
        createCustomer(newCustomerData)
            .then(customer => {
                setCustomers([...customers, customer]);  // Додаємо нового покупця до списку
                setOpenModal(false);  // Закриваємо модальне вікно після створення
            })
            .catch(error => {
                console.error('Error creating customer:', error);
            });
    };

    // Відкриття модального вікна
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    // Закриття модального вікна
    const handleCloseModal = () => {
        setOpenModal(false);
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
            <Button variant="contained" color="primary" onClick={handleOpenModal}>
                Add New Customer
            </Button>

            {/* Таблиця з переліком усіх покупців */}
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <React.Fragment key={customer.id}>
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
                                                    expandIcon={<ExpandMoreIcon />}
                                                >
                                                    <Typography>Purchase History</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    {selectedCustomer.sales && selectedCustomer.sales.length > 0 ? (
                                                        <ul>
                                                            {selectedCustomer.sales.map((sale) => (
                                                                <li key={sale.id}>
                                                                    {sale.product} - {sale.quantity_sold} units sold at {sale.selling_price_per_item} per item
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
            <Dialog open={openModal} onClose={handleCloseModal}>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={newCustomerData.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={newCustomerData.email}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="phone_number"
                        label="Phone Number"
                        type="text"
                        fullWidth
                        value={newCustomerData.phone_number}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="address"
                        label="Address"
                        type="text"
                        fullWidth
                        value={newCustomerData.address}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateCustomer} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CustomerPage;
