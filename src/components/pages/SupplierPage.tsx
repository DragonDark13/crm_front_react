import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    IconButton, Typography, Tooltip
} from '@mui/material';
import {ExpandMore as ExpandMoreIcon, Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {INewSupplier, ISupplier} from "../../utils/types";
import {useSuppliers} from "../Provider/SupplierContext";
import clsx from "clsx";
import HistoryIcon from "@mui/icons-material/History";
import AddSupplierModal from "../dialogs/AddSupplierModal/AddSupplierModal";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {
    addSupplier, deleteSupplier,
    fetchGetSupplierProducts,
    fetchGetSupplierPurchaseHistory,
    updateSupplier
} from "../../api/_supplier";

interface Supplier {
    id: number;
    name: string;
    contact_info: string;
    email?: string;
    phone_number?: string;
    address?: string;
}

interface PurchaseHistory {
    date: string;
    product: string;
    amount: number;
}

const SupplierPage: React.FC = () => {
    const {suppliers, fetchSuppliersFunc} = useSuppliers()
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [currentSupplier, setCurrentSupplier] = useState<ISupplier | null>(null);
    const [openHistory, setOpenHistory] = useState<number | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();
    const [products, setProducts] = useState([]);


    // Отримуємо історію закупівель для конкретного постачальника
    const fetchPurchaseHistory = async (supplierId: number) => {
        // Отримуємо історію закупівель постачальника
        fetchGetSupplierPurchaseHistory(supplierId)
            .then(data => {
                setPurchaseHistory(data.purchase_history);
                setProducts(data.products);
            });


    };


    // Додавання нового постачальника
    const handleAddSupplier = (newSupplier: INewSupplier) => {

        addSupplier(newSupplier)
            .then(() => {
                setOpenAddModal(false);
                fetchSuppliersFunc(); // Оновити список постачальників після додавання
                showSnackbarMessage('Supplier completed successfully!', 'success'); // Show success message

            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbarMessage('There was an error saving the supplier!', "error");
            });
    };

    const handleOpenSupplierEdit = (editSupplier: ISupplier) => {
        setCurrentSupplier(editSupplier);
        setOpenEditModal(true);
    }

    // Редагування постачальника
    const handleEditSupplier = async (supplier: ISupplier) => {
        if (!currentSupplier) return;

        try {
            await updateSupplier(currentSupplier.id, supplier)
            fetchSuppliersFunc(); // Оновити список постачальників після додавання
            showSnackbarMessage('Supplier completed successfully!', 'success'); // Show success message
            setOpenEditModal(false);
        } catch (error) {
            console.error('Error editing supplier:', error);
        }
    };

    // Видалення постачальника
    const handleDeleteSupplier = async (id: number) => {
        try {
            await deleteSupplier(id);
            fetchSuppliersFunc(); // Оновити список постачальників після додавання
            showSnackbarMessage('Supplier deleted successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('Failed to delete supplier:', error);
        }
    };

    // Відображення історії закупівель
    const toggleHistory = (id: number) => {
        if (openHistory === id) {
            setOpenHistory(null);
        } else {
            fetchPurchaseHistory(id);
            setOpenHistory(id);
        }
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
                Додати постачальника
            </Button>

            {/* Таблиця постачальників */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Назва постачальника</TableCell>
                            <TableCell>Контактна інформація</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Телефон</TableCell>
                            <TableCell>Адреса</TableCell>
                            <TableCell>Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <TableRow>
                                    <TableCell>
                                        <Typography
                                            className={clsx("supplier_name")}
                                            title={supplier.name}
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{supplier.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{supplier.contact_info || 'Не вказано'}</TableCell>
                                    <TableCell>{supplier.email || 'Не вказано'}</TableCell>
                                    <TableCell>{supplier.phone_number || 'Не вказано'}</TableCell>
                                    <TableCell>{supplier.address || 'Не вказано'}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        handleOpenSupplierEdit(supplier)
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </Button></div>
                                            <div><Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDeleteSupplier(supplier.id)}
                                            >
                                                <DeleteIcon/>
                                            </Button></div>
                                            <Button
                                                title="Історія закупівель"
                                                variant="contained"
                                                color="primary"
                                                startIcon={<HistoryIcon fontSize={"small"}/>}
                                                onClick={() => toggleHistory(supplier.id)}
                                            >
                                            </Button>
                                            {/*<Tooltip title="Історія">*/}
                                            {/*    <IconButton size={"small"} onClick={() => toggleHistory(supplier.id)}>*/}
                                            {/*        <HistoryIcon fontSize={"small"}/>*/}
                                            {/*    </IconButton>*/}
                                            {/*</Tooltip>*/}

                                            {/*<Collapse in={openHistory === supplier.id} timeout="auto" unmountOnExit>*/}
                                            {/*    <div style={{marginTop: '10px'}}>*/}
                                            {/*        <h4>Історія закупівель:</h4>*/}
                                            {/*        {purchaseHistory.map((purchase, index) => (*/}
                                            {/*            <div key={index}>*/}
                                            {/*                <strong>{purchase.date}</strong>: {purchase.product} - {purchase.amount} шт.*/}
                                            {/*            </div>*/}
                                            {/*        ))}*/}
                                            {/*        <h3>Продукти постачальника</h3>*/}
                                            {/*        <ul>*/}
                                            {/*            {products.map(product => (*/}
                                            {/*                <li key={product.id}>{product.name}</li>*/}
                                            {/*            ))}*/}
                                            {/*        </ul>*/}
                                            {/*    </div>*/}
                                            {/*</Collapse>*/}
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Рядок для розгортання історії */}
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Collapse in={openHistory === supplier.id} timeout="auto" unmountOnExit>
                                            <TableContainer>
                                                <Table size="small" sx={{marginTop: 2}}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Дата закупівлі</TableCell>
                                                            <TableCell>Товар</TableCell>
                                                            <TableCell>Кількість</TableCell>
                                                            <TableCell>Ціна за одиницю</TableCell>
                                                            <TableCell>Загальна вартість</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {purchaseHistory.length > 0 ? (
                                                            purchaseHistory.map((purchase, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {new Date(purchase.purchase_date).toLocaleDateString("uk-UA")}
                                                                    </TableCell>
                                                                    <TableCell>{purchase.product}</TableCell>
                                                                    <TableCell>{purchase.quantity_purchase}</TableCell>
                                                                    <TableCell>{purchase.purchase_price_per_item}</TableCell>
                                                                    <TableCell>{purchase.purchase_total_price}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={5} align="center">
                                                                    Даних немає
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальне вікно для додавання постачальника */}
            <AddSupplierModal
                open={openAddModal}
                handleClose={() => setOpenAddModal(false)}
                handleAddSupplier={handleAddSupplier}
            />

            {/* Модальне вікно для редагування постачальника */}
            {currentSupplier && <EditSupplierModal
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                handleEditSupplier={handleEditSupplier}
                supplier={currentSupplier}
            />}

        </div>
    );
};

// Модальне вікно для додавання постачальника
// const AddSupplierModal: React.FC<{ open: boolean; handleClose: () => void; handleAddSupplier: (supplier: { name: string; contact_info: string; email?: string; phone_number?: string; address?: string }) => void; }> = ({
//                                                                                                                                                                                                                              open,
//                                                                                                                                                                                                                              handleClose,
//                                                                                                                                                                                                                              handleAddSupplier
//                                                                                                                                                                                                                          }) => {
//     const [name, setName] = useState('');
//     const [contactInfo, setContactInfo] = useState('');
//     const [email, setEmail] = useState('');
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [address, setAddress] = useState('');
//     const [error, setError] = useState<string | null>(null);
//
//     const validate = () => {
//         if (!name.trim()) {
//             setError('Назва постачальника обов\'язкова');
//             return false;
//         }
//         setError(null);
//         return true;
//     };
//
//     const handleSave = () => {
//         if (!validate()) return;
//
//         const newSupplier = {name, contact_info: contactInfo, email, phone_number: phoneNumber, address};
//         handleAddSupplier(newSupplier);
//     };
//
//     return (
//         <Dialog open={open} onClose={handleClose}>
//             <DialogTitle>Додати нового постачальника</DialogTitle>
//             <DialogContent>
//                 <TextField
//                     minLength={10}
//                     maxLength={100}
//                     required
//                     autoFocus
//                     margin="dense"
//                     label="Назва постачальника"
//                     fullWidth
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     error={!!error}
//                     helperText={error}
//                 />
//                 <TextField
//                     margin="dense"
//                     label="Контактна інформація"
//                     fullWidth
//                     value={contactInfo}
//                     onChange={(e) => setContactInfo(e.target.value)}
//                 />
//                 <TextField
//                     margin="dense"
//                     label="Email"
//                     fullWidth
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />
//                 <TextField
//                     margin="dense"
//                     label="Телефон"
//                     fullWidth
//                     value={phoneNumber}
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                 />
//                 <TextField
//                     margin="dense"
//                     label="Адреса"
//                     fullWidth
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                 />
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={handleClose} color="primary">Відміна</Button>
//                 <Button onClick={handleSave} disabled={!name.trim()} color="primary"
//                         variant="contained">Зберегти</Button>
//             </DialogActions>
//         </Dialog>
//     );
// };


interface EditSupplierModalProps {
    open: boolean;
    handleClose: () => void;
    handleEditSupplier: (supplier: INewSupplier) => void;
    supplier: ISupplier;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({open, handleClose, handleEditSupplier, supplier}) => {


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
            setEmail(supplier?.email);
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
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Редагувати постачальника</DialogTitle>
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
                <Button onClick={handleClose} color="primary">Відміна</Button>
                <Button onClick={handleSave} color="primary" variant="contained">Зберегти</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SupplierPage;
