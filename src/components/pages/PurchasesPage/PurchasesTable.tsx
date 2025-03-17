// src/pages/PurchaseHistoryPage.tsx

import React, {useEffect, useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TableSortLabel,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Box,
    TablePagination,
    TableFooter,
    Button,
    Grid
} from '@mui/material';
import {axiosInstance} from "../../../api/api";
import clsx from "clsx";
import {ICategory} from "../../../utils/types";
import {useCategories} from "../../Provider/CategoryContext";


interface IPurchasesTable {
    categories: [number];
    type: string,
    purchase_id: number;
    product_id: number;
    name: string;
    supplier_id: number;
    supplier_name: string;
    quantity: number;
    price_per_item: number;
    total_price: number;
    date: string;
    product_categories: [number]
}

const PurchasesTable: React.FC = () => {
    const [purchaseHistory, setPurchaseHistory] = useState<IPurchasesTable[]>([]);
    const [sortConfig, setSortConfig] = useState({key: '', direction: 'asc'});
    const [filter, setFilter] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState({start: '', end: ''});
    const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [priceRangeFilter, setPriceRangeFilter] = useState({min: '', max: ''});
    const [typeFilter, setTypeFilter] = useState<string | ''>('');  // Додано фільтр по типу
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const {categories} = useCategories(); // Отримання всіх категорій

    useEffect(() => {
        fetchPurchaseHistory();
    }, []);

    const fetchPurchaseHistory = async () => {
        try {
            const response = await axiosInstance.get('/get_all_purchase_history');
            // Перетворюємо потрібні поля в числа
            const formattedData = response.data.map((item: any) => ({
                ...item,
                price_per_item: parseFloat(item.price_per_item),
                total_price: parseFloat(item.total_price),
            }));

            setPurchaseHistory(formattedData);
        } catch (error) {
            console.error('Error fetching purchase history:', error);
        }
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});

        const sortedData = [...purchaseHistory].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setPurchaseHistory(sortedData);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value.toLowerCase());
    };

    const handleDateRangeFilterChange = (field: string, value: string) => {
        setDateRangeFilter((prev) => ({...prev, [field]: value}));
    };

    const handleCategoryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setCategoryFilter(event.target.value as number);
    };

    const handleSupplierFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSupplierFilter(event.target.value as string);
    };

    const handlePriceRangeFilterChange = (field: string, value: string) => {
        setPriceRangeFilter((prev) => ({...prev, [field]: value}));
    };
    const handleTypeFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {  // Обробка зміни фільтру по типу
        setTypeFilter(event.target.value as string);
    };

    const resetFilters = () => {
        setFilter('');
        setDateRangeFilter({start: '', end: ''});
        setCategoryFilter('');
        setSupplierFilter('');
        setPriceRangeFilter({min: '', max: ''});
        setTypeFilter(''); // Скидаємо фільтр по типу
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredData = purchaseHistory.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(filter) ||
            item.supplier_name.toLowerCase().includes(filter);

        const matchesDateRange =
            (!dateRangeFilter.start || new Date(item.date) >= new Date(dateRangeFilter.start)) &&
            (!dateRangeFilter.end || new Date(item.date) <= new Date(dateRangeFilter.end));

        const matchesCategory = categoryFilter
            ? item.categories.includes(categoryFilter)
            : true;

        const matchesSupplier = supplierFilter
            ? item.supplier_name === supplierFilter
            : true;

        const matchesPriceRange =
            (priceRangeFilter.min === '' || item.price_per_item >= parseFloat(priceRangeFilter.min)) &&
            (priceRangeFilter.max === '' || item.price_per_item <= parseFloat(priceRangeFilter.max));

        const matchesType = typeFilter ? item.type === typeFilter : true; // Додаємо перевірку для фільтру по типу

        return (
            matchesSearch &&
            matchesDateRange &&
            matchesCategory &&
            matchesSupplier &&
            matchesPriceRange &&
            matchesType  // Включаємо перевірку фільтру по типу
        );
    });

    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = filteredData.reduce((sum, item) => sum + item.total_price, 0);

    const getRowStyle = (itemType: string) => {
        switch (itemType) {
            case "Other Investment":
                return {backgroundColor: "#597183"}; // Світло-синій для електроніки
            case "Packaging":
                return {backgroundColor: "#803f54"}; // Світло-рожевий для одягу
            case "Product":
                return {backgroundColor: "#a589cb"}; // Світло-фіолетовий для меблів
            default:
                return {backgroundColor: "#ffffff"}; // Білий за замовчуванням
        }
    };

    return (
        <div>
            <Typography marginBlockEnd={3} variant={"h4"}>Історія Закупівель</Typography>


            <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        sx={{marginTop: 0}}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        label="Пошук"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={filter}
                        onChange={handleFilterChange}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        label="Дата початку"
                        type="date"
                        fullWidth
                        value={dateRangeFilter.start}
                        onChange={(e) => handleDateRangeFilterChange('start', e.target.value)}
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField

                        label="Дата закінчення"
                        type="date"
                        fullWidth
                        value={dateRangeFilter.end}
                        onChange={(e) => handleDateRangeFilterChange('end', e.target.value)}
                        InputLabelProps={{shrink: true}}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth margin={"dense"}>
                        <InputLabel>Категорія</InputLabel>
                        <Select value={categoryFilter} onChange={handleCategoryFilterChange}>
                            <MenuItem title={"Всі категорії"} value="">Всі категорії</MenuItem>
                            {categories.map((category: ICategory) => (
                                <MenuItem title={category.name} key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth margin={"dense"}>
                        <InputLabel>Постачальник</InputLabel>
                        <Select value={supplierFilter} onChange={handleSupplierFilterChange}>
                            <MenuItem value="">Всі постачальники</MenuItem>
                            {Array.from(new Set(purchaseHistory.map((item) => item.supplier_name))).map(
                                (supplier, index) => (
                                    <MenuItem key={supplier + `${index}`} value={supplier}>
                                        {supplier}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth margin={"dense"}>
                        <InputLabel>Тип</InputLabel>
                        <Select value={typeFilter} onChange={handleTypeFilterChange}>
                            <MenuItem value="">Всі типи</MenuItem>
                            <MenuItem value="Other Investment">Інші інвестиції</MenuItem>
                            <MenuItem value="Packaging">Упаковка</MenuItem>
                            <MenuItem value="Product">Продукт</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        label="Мінімальна ціна"
                        type="number"
                        margin={"dense"}
                        value={priceRangeFilter.min}
                        onChange={(e) => handlePriceRangeFilterChange('min', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                    <TextField
                        fullWidth
                        label="Максимальна ціна"
                        type="number"
                        margin={"dense"}
                        value={priceRangeFilter.max}
                        onChange={(e) => handlePriceRangeFilterChange('max', e.target.value)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box marginY={2}>
                        <Button variant="contained" color="primary" onClick={resetFilters}>
                            Скинути фільтри
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Typography>Знайдено <b>{filteredData.length}</b> записів про закупку</Typography>
            <TableContainer component={Paper}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Тип
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'name'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('name')}
                                >
                                    Назва продукту
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'supplier_name'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('supplier_name')}
                                >
                                    Назва постачальника
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'quantity'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('quantity')}
                                >
                                    Кількість
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'price_per_item'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('price_per_item')}
                                >
                                    Ціна за одиницю
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'total_price'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('total_price')}
                                >
                                    Загальна ціна
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'date'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('date')}
                                >
                                    Дата
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>

                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index + row.name} style={getRowStyle(row.type)}>
                                <TableCell>
                                    <Typography
                                        variant="subtitle2">{row.type === "Other Investment" ? 'Інше' : (row.type === "Product" ? 'Товар' : 'Пакування')}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">{row.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        className={clsx("supplier_name")}
                                        title={row.supplier_name}
                                        sx={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        variant="subtitle2"
                                    >
                                        {row.supplier_name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="subtitle2">{row.quantity ? row.quantity : "Загалом"}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        variant="subtitle2">{row.price_per_item ? row.price_per_item.toFixed(2) : "Загалом"}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">{row.total_price.toFixed(2)}</Typography>
                                </TableCell>
                                <TableCell size={"small"}>
                                    <Typography whiteSpace={"nowrap"} variant="subtitle2">{row.date}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>

                            <TableCell colSpan={2}>{totalPrice.toFixed(2)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
};

export default PurchasesTable;
