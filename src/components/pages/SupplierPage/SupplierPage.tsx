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
    IconButton, Typography, Tooltip, Grid, Box, TablePagination
} from '@mui/material';
import {ExpandMore as ExpandMoreIcon, Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {INewSupplier, ISupplierFull, ISupplierType} from "../../../utils/types";
import {useSuppliers} from "../../Provider/SupplierContext";
import clsx from "clsx";
import HistoryIcon from "@mui/icons-material/History";
import AddSupplierModal from "../../dialogs/AddSupplierModal/AddSupplierModal";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import {
    addSupplier, deleteSupplier,
    fetchGetSupplierProducts,
    fetchGetSupplierPurchaseHistory,
    updateSupplier
} from "../../../api/_supplier";
import {useAuth} from "../../context/AuthContext";
import CustomDialog from "../../dialogs/CustomDialog/CustomDialog";
import EditSupplierModal from "../../dialogs/EditSupplierModal/EditSupplierModal";
import {useTheme} from "@mui/material/styles";
import AddButton from "../../Buttons/AddButton";
import RenderHeaderCell from "../../_elements/RenderHeaderCell";

interface ICurrentSupplier {
    name: string;
    contact_info: string;
    email: string;
    phone_number: string;
    address?: string;
    id: number | null
}

interface ISupplierPurchaseHistoryRecord {
    product: string;
    purchase_date: string;               // ISO string або Date — залежно від використання
    purchase_price_per_item: string;    // або number, якщо ти далі опрацьовуєш числа
    purchase_total_price: string;       // те саме
    quantity_purchase: number;
}

import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PurchasesTableTypeProductCell from "../PurchasesPage/PurchasesTableTypeProductCell";
import {
    deletePackagingSupplier,
    fetchGetPackagingSupplierPurchaseHistory,
    updatePackagingSupplier
} from "../../../api/_packagingMaterials";
import SupplierPurchaseHistoryTable from "./SupplierPurchaseHistoryTable";
import {canDeleteSupplier} from "./canDeleteSupplier";


const SupplierPage: React.FC = () => {
    const {suppliers, fetchSuppliersFunc, handleToggleSupplierActive} = useSuppliers()
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
    const [currentType, setCurrentType] = useState<ISupplierType>('product');
    const [purchaseHistory, setPurchaseHistory] = useState<ISupplierPurchaseHistoryRecord[]>([]);
    const {showSnackbarMessage} = useSnackbarMessage();
    const [products, setProducts] = useState([]);
    const {isAuthenticated} = useAuth();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDeleteSupplierId, setConfirmDeleteSupplierId] = useState<number | null>(null);
    const [confirmDeleteSupplierType, setConfirmDeleteSupplierType] = useState<ISupplierType | null>(null);


    const theme = useTheme();


    // Отримуємо історію закупівель для конкретного постачальника
    const fetchPurchaseHistory = async (supplierId: number, type: ISupplierType) => {
        setCurrentType(type)
        if (type === 'product') {
            // Отримуємо історію закупівель постачальника
            fetchGetSupplierPurchaseHistory(supplierId)
                .then(data => {
                    setPurchaseHistory(data.purchase_history);
                    setProducts(data.products);
                });
        } else if (type === 'packaging') {
            fetchGetPackagingSupplierPurchaseHistory(supplierId).then(data => {
                setPurchaseHistory(data.purchase_history);
                setProducts(data.materials);
            });
        }


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
    const handleEditSupplier = async (supplier: ISupplierFull, type: ISupplierType = 'product') => {
        if (!currentSupplier) return;

        try {
            if (currentSupplier.id !== null)

                if (type === 'product') {
                    await updateSupplier(currentSupplier.id, supplier)

                } else if (type === "packaging") {
                    await updatePackagingSupplier(currentSupplier.id, supplier)
                }

            fetchSuppliersFunc(); // Оновити список постачальників після додавання
            showSnackbarMessage('Supplier completed successfully!', 'success'); // Show success message
            setOpenEditModal(false);
        } catch (error) {
            console.error('Error editing supplier:', error);
        }
    };

    // Видалення постачальника
    const handleDeleteSupplier455 = async (id: number, type: ISupplierType = 'product') => {
        try {
            await deleteSupplier(id);
            fetchSuppliersFunc(); // Оновити список постачальників після додавання
            showSnackbarMessage('Supplier deleted successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('Failed to delete supplier:', error);
        }
    };

    const handleDeleteSupplier = async (supplierId: number, type: ISupplierType) => {
        const {canDelete, reason} = await canDeleteSupplier(supplierId, type);

        if (!canDelete) {
            showSnackbarMessage(reason || 'Цього постачальника не можна видалити.', 'warning');
            return;
        }

        setConfirmDeleteSupplierId(supplierId);
        setConfirmDeleteSupplierType(type);
        setConfirmDialogOpen(true);
    };

    // Відображення історії закупівель
    const toggleHistory = (id: number, type: 'product' | 'packaging') => {
        if (openHistory === id) {
            setOpenHistory(null);
        } else {
            fetchPurchaseHistory(id, type);
            setOpenHistory(id);
        }
    };

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedSuppliers = suppliers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const textColorDis = (is_active) => {

        if (!is_active) {
            return theme.palette.text.disabled;
        } else {
            return "inherit"
        }
    }

    return (
        <div>
            <Typography marginBlockEnd={1} variant={"h4"}>Постачальники</Typography>
            <Grid container spacing={2} justifyContent={"space-between"} marginBottom={4}>
                <Grid item> <Typography>Перегляд і керування постачальниками</Typography></Grid>
                <Grid item>
                    <AddButton text={' Додати постачальника'} onClick={() => setOpenAddModal(true)}/>

                </Grid>

            </Grid>

            <TablePagination
                component="div"
                count={suppliers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Рядків на сторінці:"
                rowsPerPageOptions={[5, 10, 25, 50]}
            />

            {/* Таблиця постачальників */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <RenderHeaderCell>Тип</RenderHeaderCell>
                            <RenderHeaderCell>Назва постачальника</RenderHeaderCell>
                            <RenderHeaderCell>Контактна інформація</RenderHeaderCell>
                            <RenderHeaderCell>Email</RenderHeaderCell>
                            <RenderHeaderCell>Телефон</RenderHeaderCell>
                            <RenderHeaderCell>Адреса</RenderHeaderCell>
                            <RenderHeaderCell>Дії</RenderHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedSuppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <TableRow
                                    sx={{background: !supplier.is_active ? theme.palette.grey[300] : (openHistory === supplier.id ? theme.palette.grey[500] : "inherit"),}}>
                                    <TableCell size={"small"}>
                                        <PurchasesTableTypeProductCell type={supplier.type}/>
                                    </TableCell>
                                    <TableCell size={"small"}>
                                        <Typography
                                            className={clsx("supplier_name")}
                                            title={supplier.name}
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: textColorDis(supplier.is_active)
                                            }}>{supplier.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell size={"small"} sx={{
                                        color: textColorDis(supplier.is_active)
                                    }}> <Typography
                                        className={clsx("contact_info")}
                                        title={supplier.contact_info}
                                        sx={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: textColorDis(supplier.is_active)
                                        }}>
                                        {supplier.contact_info || 'Не вказано'}
                                    </Typography>
                                    </TableCell>
                                    <TableCell size={"small"} sx={{
                                        color: textColorDis(supplier.is_active)
                                    }}>{supplier.email || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"} sx={{
                                        color: textColorDis(supplier.is_active)
                                    }}>{supplier.phone_number || 'Не вказано'}</TableCell>
                                    <TableCell size={"small"} sx={{
                                        color: textColorDis(supplier.is_active)
                                    }}>
                                        <Typography
                                            className={clsx("contact_info")}
                                            title={supplier.name}
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                color: textColorDis(supplier.is_active)
                                            }}>
                                            {supplier.address || 'Не вказано'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell size={"small"} sx={{
                                        color: textColorDis(supplier.is_active)
                                    }}>
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
                                                                onClick={() => toggleHistory(supplier.id, supplier.type)}>
                                                        <HistoryIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>

                                            <Grid item>
                                                <Tooltip
                                                    title={supplier.is_active ? 'Відключити постачальника' : 'Увімкнути постачальника'}
                                                >
                                                    <IconButton
                                                        color={supplier.is_active ? 'warning' : 'success'}
                                                        onClick={() => handleToggleSupplierActive(supplier.id, supplier, supplier.type)}
                                                    >
                                                        {supplier.is_active ? (
                                                            <BlockIcon fontSize="small"/>
                                                        ) : (
                                                            <CheckCircleIcon fontSize="small"/>
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>

                                            <Grid item>
                                                <Tooltip title="Видалити постачальника">

                                                    <IconButton disabled={!isAuthenticated} color="error"
                                                                onClick={() => handleDeleteSupplier(supplier.id, supplier.type)}>
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
                                        <TableCell colSpan={8}>
                                            <Collapse in={openHistory === supplier.id} timeout="auto" unmountOnExit>
                                                <SupplierPurchaseHistoryTable
                                                    type={currentType}
                                                    supplierId={openHistory}
                                                    suppliers={suppliers}
                                                    purchaseHistory={purchaseHistory}
                                                />
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>)
                                }

                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={suppliers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Рядків на сторінці:"
                rowsPerPageOptions={[5, 10, 25, 50]}
            />


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

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Підтвердження видалення</DialogTitle>
                <DialogContent>
                    <Typography>
                        Ви дійсно хочете видалити постачальника?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Скасувати</Button>
                    <Button
                        color="error"
                        onClick={async () => {
                            if (confirmDeleteSupplierId !== null && confirmDeleteSupplierType) {
                                try {
                                    if (confirmDeleteSupplierType === "product") {
                                        await deleteSupplier(confirmDeleteSupplierId);
                                    } else if (confirmDeleteSupplierType === "packaging") {
                                        await deletePackagingSupplier(confirmDeleteSupplierId)
                                    }
                                    showSnackbarMessage('Постачальника успішно видалено', 'success');
                                    fetchSuppliersFunc();
                                } catch (e) {
                                    showSnackbarMessage('Помилка при видаленні постачальника', 'error');
                                } finally {
                                    setConfirmDialogOpen(false);
                                    setConfirmDeleteSupplierId(null);
                                    setConfirmDeleteSupplierType(null);
                                }
                            }
                        }}
                    >
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>


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
