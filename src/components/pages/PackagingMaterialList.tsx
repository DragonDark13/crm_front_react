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
    Paper, Typography, Grid, Button
} from '@mui/material';
import {axiosInstance, fetchPackagingMaterials} from "../../api/api";
import {IMaterial} from "../../utils/types";
import PurchaseMaterialDialog from "../dialogs/AddNewPackagingModal/PurchaseMaterialDialog";
import MarkPackagingAsUsedDialog from "../dialogs/MarkPackagingAsUsedDialog/MarkPackagingAsUsedDialog";


const PackagingMaterialList: React.FC = () => {
    const [materials, setMaterials] = useState<IMaterial[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<string>('asc');
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
    const [defaultPricePerUnit, setDefaultPricePerUnit] = useState<number>(0);
    const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | null>(null);
    const [openDialogUpdate, setOpenDialogUpdate] = useState(false);

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
    useEffect(() => {
        if (materials.length > 0) {

        } else {
            fetchPackagingMaterials()
                .then((response) => setMaterials(response.materials))
                .catch((error) => console.error('Error fetching packaging materials:', error));
        }

    }, []);

    // Filter and sort materials
// Filter and sort materials
    const filteredMaterials = materials
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

    const purchasePackagingMaterial = async (purchaseData: {
        material_id: number;
        supplier_id?: number;
        quantity: number;
        purchase_price_per_unit: number;
    }) => {
        try {
            const response = await axiosInstance.post('/purchase_packaging_material', purchaseData);
            return response.data;
        } catch (error) {
            console.error('Error purchasing packaging material:', error);
            throw error;
        }
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

    return (
        <React.Fragment><Paper sx={{width: '100%', overflow: 'hidden'}}>
            <h1>Список пакувальних матеріалів</h1>
            <Grid justifyContent={"flex-end"} alignItems={"center"} container>
                {/* Search */}
                <Grid item>


                    <TextField
                        label="Пошук за назвою"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        margin="dense"
                    />
                </Grid>
                {/* Sorting */}
                <Grid item>
                    <Select
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
                <Grid item>


                    <Select
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


            {/* IMaterial List Table */}
            <TableContainer>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'name'}
                                    direction={sortBy === 'name' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Назва
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Постачальник</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'purchase_price_per_unit'}
                                    direction={sortBy === 'purchase_price_per_unit' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('purchase_price_per_unit')}
                                >
                                    Ціна
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'available_quantity'}
                                    direction={sortBy === 'available_quantity' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('available_quantity')}
                                >
                                    Кількість
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                Сумма
                            </TableCell>

                            <TableCell>
                                <TableSortLabel
                                    active={sortBy === 'created_date'}
                                    direction={sortBy === 'created_date' ? (sortOrder as 'asc' | 'desc') : 'asc'}
                                    onClick={() => handleSort('created_date')}
                                >
                                    Дата створення
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Дії</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMaterials.length > 0 && filteredMaterials.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell>{material.name}</TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>{material.supplier.name}</Typography></TableCell>
                                <TableCell>{material.purchase_price_per_unit}</TableCell>
                                <TableCell>
                                    <div>
                                        <Typography>
                                            <strong>Загальна: </strong>{material.total_quantity}
                                        </Typography>
                                        <Typography>
                                            <strong>В наявності: </strong>{material.available_quantity}
                                        </Typography>
                                    </div>


                                </TableCell>
                                <TableCell>
                                    <div>
                                        <Typography>
                                            <strong>Загальна: </strong>{material.total_purchase_cost}
                                        </Typography>
                                        <Typography>
                                            <strong>В наявності: </strong>{material.available_stock_cost}
                                        </Typography>
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(material.created_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpenDialog(material)}
                                    >
                                        Закупити
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpenDialogUpdate(material)}
                                    >
                                        Використано
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

            {/* Dialog for purchasing material */}
            {selectedMaterialId && (
                <PurchaseMaterialDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    materialId={selectedMaterialId}
                    onPurchaseSuccess={fetchPackagingMaterials}
                    defaultSupplierId={selectedSupplierId}
                    defaultPricePerUnit={defaultPricePerUnit}
                    suppliers={materials.map((m) => m.supplier)}
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
        </React.Fragment>
    );
};

export default PackagingMaterialList;
