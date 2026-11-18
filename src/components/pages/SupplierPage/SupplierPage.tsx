import React, {useEffect, useRef, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
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
    IconButton,
    Typography,
    Tooltip,
    Grid,
    TablePagination
} from '@mui/material';
import {Edit as EditIcon, Delete as DeleteIcon} from '@mui/icons-material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import {ISupplierFull, INewSupplier, ISupplierType} from "../../../utils/types";
import {useSuppliers} from "../../Provider/SupplierContext";
import clsx from "clsx";
import AddSupplierModal from "../../dialogs/AddSupplierModal/AddSupplierModal";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import {
    addSupplier,
    deleteSupplier,
    fetchGetSupplierPurchaseHistory,
    updateSupplier
} from "../../../api/_supplier";
import {
    deletePackagingSupplier,
    fetchGetPackagingSupplierPurchaseHistory,
    updatePackagingSupplier
} from "../../../api/_packagingMaterials";
import {useAuth} from "../../context/AuthContext";
import EditSupplierModal from "../../dialogs/EditSupplierModal/EditSupplierModal";
import {useTheme} from "@mui/material/styles";
import AddButton from "../../Buttons/AddButton";
import RenderHeaderCell from "../../_elements/RenderHeaderCell";
import PurchasesTableTypeProductCell from "../PurchasesPage/PurchasesTableTypeProductCell";
import SupplierPurchaseHistoryTable from "./SupplierPurchaseHistoryTable";
import {canDeleteSupplier} from "./canDeleteSupplier";

type ICurrentSupplier = Omit<ISupplierFull, 'id'> & {id: number};

type ISupplierPurchaseHistoryRecord =
    | {
        product: string;
        purchase_date: string;
        purchase_price_per_item: number;
        purchase_total_price: number;
        quantity_purchase: number;
    }
    | {
        material: string;
        purchase_date: string;
        purchase_price_per_unit: number;
        purchase_total_price: number;
        quantity_purchased: number;
    };

interface IOpenSupplierHistory {
    id: number;
    type: ISupplierType;
}

const SupplierPage: React.FC = () => {
    const {suppliers, fetchSuppliersFunc, handleToggleSupplierActive} = useSuppliers();
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState<boolean>(false);
    const [currentSupplier, setCurrentSupplier] = useState<ICurrentSupplier>({
        address: '',
        contact_info: "",
        email: "",
        name: "",
        phone_number: "",
        id: 0,
        is_active: true,
        type: 'product'
    });
    const [openHistory, setOpenHistory] = useState<IOpenSupplierHistory | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<ISupplierPurchaseHistoryRecord[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(false);
    const historyRequestId = useRef(0);
    const {showSnackbarMessage} = useSnackbarMessage();
    const {isAuthenticated} = useAuth();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDeleteSupplierId, setConfirmDeleteSupplierId] = useState<number | null>(null);
    const [confirmDeleteSupplierType, setConfirmDeleteSupplierType] = useState<ISupplierType | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

    const theme = useTheme();

    useEffect(() => () => {
        historyRequestId.current += 1;
    }, []);

    useEffect(() => {
        const lastPage = Math.max(0, Math.ceil(suppliers.length / rowsPerPage) - 1);
        if (page > lastPage) {
            setPage(lastPage);
        }
    }, [page, rowsPerPage, suppliers.length]);

    // Отримуємо історію закупівель для конкретного постачальника.
    const fetchPurchaseHistory = async (supplierId: number, type: ISupplierType) => {
        const requestId = ++historyRequestId.current;
        setPurchaseHistory([]);
        setIsHistoryLoading(true);
        setHistoryError(false);

        try {
            const data = type === 'product'
                ? await fetchGetSupplierPurchaseHistory(supplierId)
                : await fetchGetPackagingSupplierPurchaseHistory(supplierId);

            if (requestId !== historyRequestId.current) {
                return;
            }

            setPurchaseHistory(data.purchase_history);
        } catch (error) {
            if (requestId !== historyRequestId.current) {
                return;
            }

            console.error('Error fetching supplier purchase history:', error);
            setHistoryError(true);
            showSnackbarMessage('Не вдалося завантажити історію постачальника.', 'error');
        } finally {
            if (requestId === historyRequestId.current) {
                setIsHistoryLoading(false);
            }
        }
    };

    // Додавання нового постачальника.
    const handleAddSupplier = (newSupplier: INewSupplier) => {
        addSupplier(newSupplier)
            .then(() => {
                setOpenAddModal(false);
                fetchSuppliersFunc();
                showSnackbarMessage('Supplier completed successfully!', 'success');
            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbarMessage('There was an error saving the supplier!', "error");
            });
    };

    const handleOpenSupplierEdit = (editSupplier: ISupplierFull) => {
        setCurrentSupplier(editSupplier);
        setOpenEditModal(true);
    };

    // Редагування постачальника.
    const handleEditSupplier = async (supplier: INewSupplier, type: ISupplierType = 'product') => {
        if (!currentSupplier) return;

        const updatedSupplier: ISupplierFull = {
            ...currentSupplier,
            ...supplier,
            contact_info: supplier.contact_info ?? currentSupplier.contact_info,
            email: supplier.email ?? currentSupplier.email,
            phone_number: supplier.phone_number ?? currentSupplier.phone_number,
            address: supplier.address ?? currentSupplier.address
        };

        try {
            if (currentSupplier.id > 0) {
                if (type === 'product') {
                    await updateSupplier(currentSupplier.id, updatedSupplier);
                } else {
                    await updatePackagingSupplier(currentSupplier.id, updatedSupplier);
                }
            }

            fetchSuppliersFunc();
            showSnackbarMessage('Supplier completed successfully!', 'success');
            setOpenEditModal(false);
        } catch (error) {
            console.error('Error editing supplier:', error);
            showSnackbarMessage('There was an error updating the supplier!', 'error');
        }
    };

    // Перевірка можливості видалення та відкриття підтвердження.
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

    // Видалення після підтвердження користувачем.
    const handleConfirmDeleteSupplier = async () => {
        if (confirmDeleteSupplierId === null || !confirmDeleteSupplierType || isDeletingSupplier) {
            return;
        }

        setIsDeletingSupplier(true);
        try {
            if (confirmDeleteSupplierType === 'product') {
                await deleteSupplier(confirmDeleteSupplierId);
            } else {
                await deletePackagingSupplier(confirmDeleteSupplierId);
            }

            showSnackbarMessage('Постачальника успішно видалено', 'success');
            const refreshed = await fetchSuppliersFunc();
            if (!refreshed) {
                showSnackbarMessage('Постачальника видалено, але список не вдалося оновити.', 'warning');
            }
        } catch (error) {
            console.error('Failed to delete supplier:', error);
            showSnackbarMessage('Помилка при видаленні постачальника', 'error');
        } finally {
            setIsDeletingSupplier(false);
            setConfirmDialogOpen(false);
            setConfirmDeleteSupplierId(null);
            setConfirmDeleteSupplierType(null);
        }
    };

    // Відображення історії закупівель конкретного постачальника.
    const toggleHistory = (id: number, type: ISupplierType) => {
        if (openHistory?.id === id && openHistory.type === type) {
            historyRequestId.current += 1;
            setOpenHistory(null);
            setIsHistoryLoading(false);
            setHistoryError(false);
            setPurchaseHistory([]);
            return;
        }

        setOpenHistory({id, type});
        void fetchPurchaseHistory(id, type);
    };

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

    const textColorDis = (is_active: boolean) => {
        if (!is_active) {
            return theme.palette.text.disabled;
        }
        return "inherit";
    };

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
                        {paginatedSuppliers.map((supplier) => {
                            const isHistoryOpen = openHistory?.id === supplier.id && openHistory.type === supplier.type;

                            return (
                                <React.Fragment key={`${supplier.type}-${supplier.id}`}>
                                    <TableRow
                                        sx={{background: !supplier.is_active ? theme.palette.grey[300] : (isHistoryOpen ? theme.palette.grey[500] : "inherit"),}}>
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
                                    {isHistoryOpen && (
                                        <TableRow sx={{background: theme.palette.grey[500],}}>
                                            <TableCell colSpan={8}>
                                                <Collapse in={isHistoryOpen} timeout="auto" unmountOnExit>
                                                    {isHistoryLoading ? (
                                                        <Typography>Завантаження історії постачальника...</Typography>
                                                    ) : historyError ? (
                                                        <Typography color="error">Не вдалося завантажити історію постачальника.</Typography>
                                                    ) : (
                                                        <SupplierPurchaseHistoryTable
                                                            type={openHistory.type}
                                                            supplierId={openHistory.id}
                                                            suppliers={suppliers}
                                                            purchaseHistory={purchaseHistory}
                                                        />
                                                    )}
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
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
                    <Button disabled={isDeletingSupplier} onClick={() => setConfirmDialogOpen(false)}>Скасувати</Button>
                    <Button
                        color="error"
                        disabled={isDeletingSupplier}
                        onClick={handleConfirmDeleteSupplier}
                    >
                        Видалити
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SupplierPage;
