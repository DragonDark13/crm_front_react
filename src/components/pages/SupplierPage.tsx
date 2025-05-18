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
    IconButton, Typography, Tooltip, Grid, Box
} from '@mui/material';
import {ExpandMore as ExpandMoreIcon, Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {INewSupplier, ISupplierFull} from "../../utils/types";
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
import {useAuth} from "../context/AuthContext";
import CustomDialog from "../dialogs/CustomDialog/CustomDialog";
import EditSupplierModal from "../dialogs/EditSupplierModal/EditSupplierModal";
import {useTheme} from "@mui/material/styles";

interface ICurrentSupplier {
    name: string;
    contact_info: string;
    email: string;
    phone_number: string;
    address?: string;
    id: number | null
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
    const [currentSupplier, setCurrentSupplier] = useState<ICurrentSupplier>({
        address: '',
        contact_info: "",
        email: "",
        name: "",
        phone_number: "",
        id: null
    });
    const [openHistory, setOpenHistory] = useState<number | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();
    const [products, setProducts] = useState([]);
    const {isAuthenticated} = useAuth();

    const theme = useTheme();


    console.log('purchaseHistory: ', purchaseHistory);


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

    const handleOpenSupplierEdit = (editSupplier: ISupplierFull) => {
        setCurrentSupplier(editSupplier);
        setOpenEditModal(true);
    }

    // Редагування постачальника
    const handleEditSupplier = async (supplier: ISupplierFull) => {
        if (!currentSupplier) return;

        try {
            if (currentSupplier.id !== null)
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
            <Typography marginBlockEnd={1} variant={"h4"}>Постачальники</Typography>
            <Grid container spacing={2} justifyContent={"space-between"} marginBottom={4}>
                <Grid item> <Typography>Перегляд і керування постачальниками</Typography></Grid>
                <Grid item> <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>
                    Додати постачальника
                </Button></Grid>

            </Grid>


            {/* Таблиця постачальників */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography>Назва постачальника</Typography></TableCell>
                            <TableCell><Typography>Контактна інформація</Typography></TableCell>
                            <TableCell><Typography>Email</Typography></TableCell>
                            <TableCell><Typography>Телефон</Typography></TableCell>
                            <TableCell><Typography>Адреса</Typography></TableCell>
                            <TableCell><Typography>Дії</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <TableRow
                                    sx={{background: openHistory === supplier.id ? theme.palette.grey[500] : "inherit",}}>
                                    <TableCell size={"small"}>
                                        <Typography
                                            className={clsx("supplier_name")}
                                            title={supplier.name}
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{supplier.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell size={"small"}>{supplier.contact_info || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"}>{supplier.email || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"}>{supplier.phone_number || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"}>{supplier.address || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"}>
                                        <Grid container>
                                            <Grid item>
                                                <Tooltip title="Редагувати">
                                                    <IconButton color="primary"
                                                                onClick={() => handleOpenSupplierEdit(supplier)}>
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>


                                            <Grid item>
                                                <Tooltip title="Історія постачальника">
                                                    <IconButton color="info"
                                                                onClick={() => toggleHistory(supplier.id)}>
                                                        <HistoryIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>

                                            <Grid item>
                                                <Tooltip title="Видалити постачальника">

                                                    <IconButton disabled={!isAuthenticated} color="error"
                                                                onClick={() => handleDeleteSupplier(supplier.id)}>
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>


                                                </Tooltip>
                                            </Grid>

                                        </Grid>
                                    </TableCell>
                                </TableRow>

                                {/* Рядок для розгортання історії */}
                                {openHistory === supplier.id &&
                                (
                                    <TableRow sx={{background: theme.palette.grey[500],}}>
                                        <TableCell colSpan={6}>
                                            <Collapse in={openHistory === supplier.id} timeout="auto" unmountOnExit>
                                                <TableContainer>
                                                    <Table size="small" sx={{marginTop: 2}}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell colSpan={7} size={"small"}>
                                                                    <Typography variant={"h6"}>
                                                                        Історія операцій постачальника
                                                                        <span> {suppliers.find((supplier) => supplier.id === openHistory).name}</span>
                                                                    </Typography>

                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell size={"small"}>Дата закупівлі</TableCell>
                                                                <TableCell size={"small"}>Товар</TableCell>
                                                                <TableCell size={"small"}>Кількість</TableCell>
                                                                <TableCell size={"small"}>Ціна за одиницю</TableCell>
                                                                <TableCell size={"small"}>Загальна вартість</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {purchaseHistory.length > 0 ? (
                                                                purchaseHistory.map((purchase, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell size={"small"}>
                                                                            {new Date(purchase.purchase_date).toLocaleDateString("uk-UA")}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            size={"small"}>{purchase.product}</TableCell>
                                                                        <TableCell
                                                                            size={"small"}>{purchase.quantity_purchase}</TableCell>
                                                                        <TableCell
                                                                            size={"small"}>{purchase.purchase_price_per_item}</TableCell>
                                                                        <TableCell
                                                                            size={"small"}>{purchase.purchase_total_price}</TableCell>
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
                                    </TableRow>)
                                }

                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальне вікно для додавання постачальника */}
            <AddSupplierModal
                open={openAddModal}
                handleCloseAddSupplierModal={() => setOpenAddModal(false)}
                handleAddSupplier={handleAddSupplier}
                isAuthenticated={isAuthenticated}/>

            {/* Модальне вікно для редагування постачальника */}
            {currentSupplier && <EditSupplierModal
                isAuthenticated={isAuthenticated}
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


export default SupplierPage;
