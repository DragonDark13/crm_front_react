import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    TextField,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper, Typography, Grid, Button, DialogActions, DialogTitle, DialogContent, Dialog, Box, TablePagination
} from '@mui/material';
import {IMaterial, MaterialHistoryItem, PackagingMaterialHistory} from "../../utils/types";
import PurchaseMaterialDialog from "../dialogs/packagingModal/AddNewPackagingModal/PurchaseMaterialDialog";
import MarkPackagingAsUsedDialog from "../dialogs/packagingModal/MarkPackagingAsUsedDialog/MarkPackagingAsUsedDialog";
import MaterialHistoryTable from "./MaterialHistoryTable";
import {usePackaging} from "../Provider/PackagingContext";
import {fetchListPackagingMaterials, getCurrentPackagingHistory} from "../../api/_packagingMaterials";
import DeleteAllMaterialsDialog from "../dialogs/packagingModal/DeleteAllMaterialsDialog/DeleteAllMaterialsDialog";
import {useAuth} from "../context/AuthContext";
import {Tooltip, IconButton} from '@mui/material';
import {AddShoppingCart, Update, History} from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";

const PackagingMaterialList: React.FC = () => {
        const {packagingMaterials} = usePackaging()
        const {isAuthenticated} = useAuth();
        const [searchTerm, setSearchTerm] = useState<string>('');
        const [sortBy, setSortBy] = useState<string>('name');
        const [sortOrder, setSortOrder] = useState<string>('asc');
        const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
        const [dialogOpen, setDialogOpen] = useState<boolean>(false);
        const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
        const [defaultPricePerUnit, setDefaultPricePerUnit] = useState<number>(0);
        const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | null>(null);
        const [openDialogUpdate, setOpenDialogUpdate] = useState(false);
        const [historyDialogOpen, setHistoryDialogOpen] = useState<boolean>(false);
        const [materialHistory, setMaterialHistory] = useState<MaterialHistoryItem[]>([]);

        const mapMaterialHistory = (history: PackagingMaterialHistory): MaterialHistoryItem[] => {
            const purchaseMapped = history.purchase_history.map(purchase => ({
                date: purchase.purchase_date,
                description: `Закупівля у постачальника (ID: ${purchase.supplier_id}), ціна за одиницю: ${purchase.purchase_price_per_unit}`,
                quantity: purchase.quantity_purchased,
            }));

            const salesMapped = history.sales_history.map(sale => ({
                date: sale.sale_date,
                description: `Продаж (ID продажу: ${sale.sale_id}), загальна вартість: ${sale.total_packaging_cost}`,
                quantity: -sale.packaging_quantity, // Від'ємне значення для продажу
            }));

            const stockMapped = history.stock_history.map(stock => ({
                date: stock.change_date,
                description: `Зміна на складі, новий залишок: ${stock.new_total}`,
                quantity: stock.quantity_changed,
            }));

            // Об'єднання всіх подій, сортування за датою
            return [...purchaseMapped, ...salesMapped, ...stockMapped].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        };

        const fetchMaterialHistory = (materialId: number) => {

            getCurrentPackagingHistory(materialId)
                .then(data => {
                    const mappedData = mapMaterialHistory(data);
                    setMaterialHistory(mappedData);
                })
                .catch((error) => console.error('Error fetching packaging materials:', error));
        };

        const handleOpenHistoryDialog = (material: IMaterial) => {
            setSelectedMaterial(material);
            fetchMaterialHistory(material.id); // Fetch history when opening the dialog
            setHistoryDialogOpen(true);
        };

        const handleCloseHistoryDialog = () => {
            setHistoryDialogOpen(false);
            setSelectedMaterial(null);
            setMaterialHistory([]); // Clear history data when closing the dialog
        };

        const handleOpenDialogUpdate = (material: IMaterial) => {
            setSelectedMaterial(material);
            setOpenDialogUpdate(true);
        };

        const handleCloseDialogUpdate = () => {
            setOpenDialogUpdate(false);
            setSelectedMaterial(null);
        };

        const handleUpdateSuccess = () => {
            // Логіка оновлення після успішного позначення пакування як використаного
            console.log("Update was successful!");
            handleCloseDialogUpdate(); // Закриваємо діалог після успіху
        };

        // Fetch materials from backend using Axios
        // useEffect(() => {
        //     if (materials.length > 0) {
        //
        //     } else {
        //         fetchListPackagingMaterials()
        //             .then((response) => setMaterials(response.materials))
        //             .catch((error) => console.error('Error fetching packaging materials:', error));
        //     }
        //
        // }, []);

        // Filter and sort materials
// Filter and sort materials
        const filteredMaterials = packagingMaterials
            .filter((material) =>
                material.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return sortOrder === 'asc'
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                } else if (sortBy === 'purchase_price_per_unit') {
                    return sortOrder === 'asc'
                        ? a.purchase_price_per_unit - b.purchase_price_per_unit
                        : b.purchase_price_per_unit - a.purchase_price_per_unit;
                } else if (sortBy === 'available_quantity') {
                    return sortOrder === 'asc'
                        ? a.available_quantity - b.available_quantity
                        : b.available_quantity - a.available_quantity;
                } else if (sortBy === 'created_date') {
                    const dateA = new Date(a.created_date);
                    const dateB = new Date(b.created_date);
                    return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                }
                return 0;
            });

        const handleSort = (property: string) => {
            const isAsc = sortBy === property && sortOrder === 'asc';
            setSortBy(property);
            setSortOrder(isAsc ? 'desc' : 'asc');
        };


        const handleOpenDialog = (material: IMaterial) => {
            setSelectedMaterialId(material.id);
            setSelectedSupplierId(material.supplier.id || null); // Передаємо ID постачальника
            setDefaultPricePerUnit(material.purchase_price_per_unit || 0); // Передаємо ціну за одиницю
            setDialogOpen(true);
        };

        const handleCloseDialog = () => {
            setDialogOpen(false);
            setSelectedMaterialId(null);
            setSelectedSupplierId(null);
            setDefaultPricePerUnit(0);
        };

        const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(5); // Кількість рядків на сторінці

// Функція для обробки зміни сторінки
        const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, newPage: number) => {
            setPage(newPage);
        };

// Функція для обробки зміни кількості рядків на сторінці
        const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0); // Після зміни кількості рядків на сторінці скидаємо поточну сторінку на першу
        };

// Обчислення відображених даних на поточній сторінці
        const currentMaterials = filteredMaterials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

        return (
            <React.Fragment>
                <Typography marginBlockEnd={3} variant={"h4"}>Список пакувальних матеріалів</Typography>
                {isAuthenticated && <Grid container>
                    <Grid item>
                        <DeleteAllMaterialsDialog/>
                    </Grid>
                </Grid>}
                <Grid  alignItems={"center"} container spacing={2}>
                    {/* Search */}
                    <Grid item xs={12} md={4}>


                        <TextField
                            size={"small"}
                            hiddenLabel={true}
                            placeholder="Пошук за назвою"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            margin="none"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography align={"right"}>
                            Сортування по:
                        </Typography>
                    </Grid>
                    {/* Sorting */}
                    <Grid item xs={12} md={3}>
                        <Select
                            size={"small"}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            fullWidth
                            margin="dense"
                        >
                            <MenuItem value="name">Назва</MenuItem>
                            <MenuItem value="purchase_price_per_unit">Ціна</MenuItem>
                            <MenuItem value="available_quantity">Кількість в наявності</MenuItem>
                            <MenuItem value="created_date">Дата
                                створення</MenuItem> {/* Added sorting option for created_date */}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={2}>


                        <Select
                            size={"small"}
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            fullWidth
                            margin="dense"
                        >
                            <MenuItem value="asc">По зростанню</MenuItem>
                            <MenuItem value="desc">По спаданню</MenuItem>
                        </Select>
                    </Grid>
                </Grid>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredMaterials.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                {/* IMaterial List Table */}
                <TableContainer component={Paper} style={{marginTop: '20px'}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell size={"small"}>
                                    <TableSortLabel
                                        active={sortBy === 'name'}
                                        direction={sortBy === 'name' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                        onClick={() => handleSort('name')}
                                    >
                                        Назва
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell size={"small"}><Typography>Постачальник</Typography></TableCell>
                                <TableCell size={"small"}>
                                    <TableSortLabel
                                        active={sortBy === 'purchase_price_per_unit'}
                                        direction={sortBy === 'purchase_price_per_unit' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                        onClick={() => handleSort('purchase_price_per_unit')}
                                    >
                                        Собівартість
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell size={"small"}>
                                    <TableSortLabel
                                        active={sortBy === 'available_quantity'}
                                        direction={sortBy === 'available_quantity' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                        onClick={() => handleSort('available_quantity')}
                                    >
                                        Кількість
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell size={"small"}>
                                   <div>
                                        Сумма
                                        {/*<Typography variant={"subtitle2"} color={"secondary"}>*/}
                                        {/*    За весь час*/}
                                        {/*</Typography>*/}
                                        {/*<Typography variant={"subtitle2"} color={"primary"}>*/}
                                        {/*    В наявності*/}
                                        {/*</Typography>*/}
                                    </div>
                                </TableCell>

                                <TableCell size={"small"}>
                                    <TableSortLabel
                                        active={sortBy === 'created_date'}
                                        direction={sortBy === 'created_date' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                        onClick={() => handleSort('created_date')}
                                    >
                                        Дата створення
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{minWidth:160}} size={"small"}><Typography>Дії</Typography></TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentMaterials.length > 0 && currentMaterials.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell size={"small"}><Typography variant={"subtitle2"}>{material.name}</Typography></TableCell>
                                    <TableCell size={"small"}>
                                        <Typography
                                            variant={"subtitle2"}
                                            sx={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>{material.supplier.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell size={"small"}>
                                        {material.purchase_price_per_unit}
                                    </TableCell>
                                    <TableCell size={"small"}>
                                        <div>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                    <Tooltip title="За весь час">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "secondary.main",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {material.total_quantity}
                                                            </Box>
                                                        </Box>
                                                    </Tooltip>

                                                    <Tooltip title="Кількість товару, яка є в наявності">
                                                        <Box display="flex" alignItems="center" gap={1}>

                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "secondary.dark",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {material.available_quantity}
                                                            </Box>
                                                        </Box>
                                                    </Tooltip>
                                            </Box>
                                            {/*<Typography variant={"subtitle2"}>*/}
                                            {/*    <strong>Загальна: </strong>{material.total_quantity}*/}
                                            {/*</Typography>*/}
                                            {/*<Typography variant={"subtitle2"}>*/}
                                            {/*    <strong>В наявності: </strong>{material.available_quantity}*/}
                                            {/*</Typography>*/}
                                        </div>
                                    </TableCell>
                                    <TableCell size={"small"}>
                                        <div>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                    <Tooltip title="За весь час">
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "50%",
                                                                    backgroundColor: "secondary.main",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {material.total_purchase_cost}
                                                            </Box>
                                                        </Box>
                                                    </Tooltip>

                                                    <Tooltip title="За наявне пакування">
                                                        <Box display="flex" alignItems="center" gap={1}>

                                                            <Box
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: "50%",
                                                                    backgroundColor:  "secondary.dark",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {material.available_stock_cost}
                                                            </Box>
                                                        </Box>
                                                    </Tooltip>
                                            </Box>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        size={"small"}>{new Date(material.created_date).toLocaleDateString()}</TableCell>


                                    <TableCell size={"small"}>
                                        <Grid container>
                                            <Grid item>
                                                <Tooltip title="Закупити" placement="top">
                                                    <IconButton  color="primary" onClick={() => handleOpenDialog(material)}>
                                                                        <ShoppingCartIcon color="primary" fontSize="small" />

                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                            <Grid item>
                                                <Tooltip title="Використано" placement="top">
                                                    <IconButton color="primary"
                                                                onClick={() => handleOpenDialogUpdate(material)}>
                                                        <Update fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                            <Grid item>
                                                <Tooltip title="Історія" placement="top">
                                                    <IconButton color="secondary"
                                                                onClick={() => handleOpenHistoryDialog(material)}>

                                                        <HistoryIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredMaterials.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {/* Dialog for purchasing material */}
                {selectedMaterialId && (
                    <PurchaseMaterialDialog
                        open={dialogOpen}
                        onClose={handleCloseDialog}
                        materialId={selectedMaterialId}
                        onPurchaseSuccess={fetchListPackagingMaterials}
                        defaultSupplierId={selectedSupplierId}
                        defaultPricePerUnit={defaultPricePerUnit}
                        suppliers={packagingMaterials.map((m) => m.supplier)}
                    />
                )}

                {selectedMaterial && (
                    <MarkPackagingAsUsedDialog
                        open={openDialogUpdate}
                        onClose={handleCloseDialogUpdate}
                        materialId={selectedMaterial.id}
                        materialName={selectedMaterial.name}
                        availableQuantity={selectedMaterial.available_quantity}
                        onUpdateSuccess={handleUpdateSuccess}
                    />
                )}

                {/* History Dialog */}
                {selectedMaterial && (
                    <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog}>
                        <DialogTitle>Історія {selectedMaterial.name}</DialogTitle>
                        <DialogContent>
                            <MaterialHistoryTable materialHistory={materialHistory}/>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseHistoryDialog} color="primary">Закрити</Button>
                        </DialogActions>
                    </Dialog>)}
            </React.Fragment>
        );
    }
;

export default PackagingMaterialList;
