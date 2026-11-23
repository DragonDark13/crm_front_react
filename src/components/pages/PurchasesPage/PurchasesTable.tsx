// src/pages/PurchaseHistoryPage.tsx

import React, {useCallback, useEffect, useState} from 'react';
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
    Grid, Slider, Collapse, Tooltip, Card, CardContent, Stack, Divider
} from '@mui/material';
import clsx from "clsx";
import {ICategory} from "../../../utils/types";
import {useCategories} from "../../Provider/CategoryContext";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Товар
import AllInboxIcon from '@mui/icons-material/AllInbox';     // Пакування
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {AttachMoney, Luggage, ShoppingBag} from "@mui/icons-material";
import PurchaseHistoryFilter from "./PurchaseHistoryFilter";
import PurchasesTableTypeProductCell from "./PurchasesTableTypeProductCell";
import {fetchGetAllPurchaseHistory, IPurchaseTableResponseResponse} from "../../../api/_history.ts";   // Інше

export interface IPurchasesTable {
    categories: number[];
    type: string,
    name: string;
    supplier_id: number | null;
    supplier_name: string;
    quantity: number;
    price_per_item: number;
    total_price: number;
    date: string;
    supplier_is_active:boolean
}

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
    key: T | null;
    direction: SortDirection;
}

type SortableKeys =
    | "name"
    | "price_per_item"
    | "quantity"
    | "date";

type PurchaseColumn =
    | {key: SortableKeys; label: string; sortable: true}
    | {key: "type" | "supplier_name" | "total_price"; label: string; sortable: false};

const PurchasesTable: React.FC = () => {
    const [purchaseHistory, setPurchaseHistory] = useState<IPurchasesTable[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig<SortableKeys>>({
        key: null,
        direction: 'asc',
    });
    const [filter, setFilter] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState({start: '', end: ''});
    const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
    const [supplierFilter, setSupplierFilter] = useState('');
    const [priceRangeFilterSlider, setPriceRangeFilterSlider] = useState<number[]>([0, 0]);

    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
    const [typeFilter, setTypeFilter] = useState<string | ''>('');  // Додано фільтр по типу
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const {categories} = useCategories(); // Отримання всіх категорій

    const fetchPurchaseHistory = useCallback(async () => {
        try {
          const data =await fetchGetAllPurchaseHistory();
            // Перетворюємо потрібні поля в числа
            const formattedData =data.map((item: IPurchaseTableResponseResponse) => ({
                ...item,
                price_per_item: item.price_per_item === null ? 0 : Number(item.price_per_item),
                total_price: Number(item.total_price),
                quantity: item.quantity ?? 0,
            }));

            setPurchaseHistory(formattedData);

            const prices = formattedData
                .map(item => item.price_per_item)
                .filter(price => !isNaN(price));

            if (prices.length > 0) {
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                setPriceBounds([min, max]);
                setPriceRangeFilterSlider([min, max]);
            } else {
                // fallback: якщо нема цін — встановлюємо дефолтні межі
                setPriceBounds([0, 1000]);
                setPriceRangeFilterSlider([0, 1000]);
            }
        } catch (error) {
            console.error('Error fetching purchase history:', error);
        }
    }, []);

    useEffect(() => {
        void fetchPurchaseHistory();
    }, [fetchPurchaseHistory]);

    const handleSort = (key: SortableKeys) => {
        let direction: SortDirection = 'asc';

        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key, direction });

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


    const handleTypeFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {  // Обробка зміни фільтру по типу
        setTypeFilter(event.target.value as string);
    };

    const resetFilters = () => {
        setFilter('');
        setDateRangeFilter({start: '', end: ''});
        setCategoryFilter('');
        setSupplierFilter('');
        setPriceRangeFilterSlider(priceBounds)
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
            item.price_per_item >= priceRangeFilterSlider[0] &&
            item.price_per_item <= priceRangeFilterSlider[1];

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

    const isAnyFilterActive =
        filter !== '' ||
        dateRangeFilter.start !== '' ||
        dateRangeFilter.end !== '' ||
        categoryFilter !== '' ||
        supplierFilter !== '' ||
        typeFilter !== '' ||
        priceRangeFilterSlider[0] !== priceBounds[0] ||
        priceRangeFilterSlider[1] !== priceBounds[1];


    console.log('Array.from(new Set(purchaseHistory))', Array.from(new Set(purchaseHistory.map((item) => item.supplier_name))));

    const columns: PurchaseColumn[] = [
        {key: 'type', label: 'Тип', sortable: false},
        {key: 'name', label: 'Назва продукту', sortable: true},
        {key: 'supplier_name', label: 'Назва постачальника', sortable: false},
        {key: 'quantity', label: 'Кількість', sortable: true},
        {key: 'price_per_item', label: 'Ціна за одиницю', sortable: true},
        {key: 'total_price', label: 'Загальна ціна', sortable: false},
        {key: 'date', label: 'Дата', sortable: true}
    ];

    console.log('paginatedData', paginatedData);

    return (
        <div>
            <Typography className="crm-page-title" component="h1" marginBlockEnd={3} variant={"h4"}>Історія Закупівель</Typography>

            <Button
                startIcon={filtersOpen ? <FilterListOffIcon/> : <FilterListIcon/>}
                variant="outlined"
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{marginBottom: '10px'}}
            >
                {filtersOpen ? 'Сховати фільтри' : 'Показати фільтри'}
            </Button>
            <Collapse in={filtersOpen}>
                <PurchaseHistoryFilter
                    categories={categories}
                    categoryFilter={categoryFilter}
                    dateRangeFilter={dateRangeFilter}
                    filter={filter}
                    handleCategoryFilterChange={handleCategoryFilterChange}
                    handleDateRangeFilterChange={handleDateRangeFilterChange}
                    handleFilterChange={handleFilterChange}
                    handleSupplierFilterChange={handleSupplierFilterChange}
                    handleTypeFilterChange={handleTypeFilterChange}
                    priceBounds={priceBounds}
                    priceRangeFilterSlider={priceRangeFilterSlider}
                    purchaseHistory={purchaseHistory}
                    setPriceRangeFilterSlider={setPriceRangeFilterSlider}
                    supplierFilter={supplierFilter}
                    typeFilter={typeFilter}

                />
            </Collapse>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Box marginBottom={2}>
                        <Button disabled={!isAnyFilterActive} variant="contained" color="primary"
                                onClick={resetFilters}>
                            Скинути фільтри
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Typography>Знайдено <b>{filteredData.length}</b> записів про закупку</Typography>

            <div className="mobile-card-list">
                {paginatedData.length ? paginatedData.map((row, index) => (
                    <Card key={index + row.name} variant="outlined">
                        <CardContent>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                    <Box sx={{minWidth: 0}}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PurchasesTableTypeProductCell type={row.type}/>
                                            <Typography variant="subtitle1" fontWeight={700}>{row.name}</Typography>
                                        </Stack>
                                        <Typography variant="body2" color={!row.supplier_is_active ? 'text.disabled' : 'text.secondary'}>{row.supplier_name}</Typography>
                                    </Box>
                                    <Typography fontWeight={700} whiteSpace="nowrap">{row.total_price.toFixed(2)} грн</Typography>
                                </Stack>
                                <Divider />
                                <Typography variant="body2">Кількість: {row.quantity ? row.quantity : "Загалом"}</Typography>
                                <Typography variant="body2">Ціна за одиницю: {row.price_per_item ? row.price_per_item.toFixed(2) : "Загалом"} грн</Typography>
                                <Typography variant="caption" color="text.secondary">{row.date}</Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                )) : <Typography color="text.secondary">Закупівель не знайдено</Typography>}
                <Typography fontWeight={700} textAlign="right">Загальна сума закупівель: {totalPrice.toFixed(2)} грн</Typography>
            </div>
            <div className="desktop-data-table">
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
                            {columns.map((column) => (
                                <TableCell key={column.key}>
                                    {column?.sortable === false ? (
                                        <Typography>{column.label}</Typography>
                                    ) : (
                                        <TableSortLabel
                                            active={sortConfig.key === column.key}
                                            direction={sortConfig.direction}
                                            onClick={() => handleSort(column.key)}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index + row.name} style={getRowStyle(row.type)}>
                                <TableCell>
                                    <PurchasesTableTypeProductCell type={row.type}/>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2">{row.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography
                                        color={!row.supplier_is_active  ? 'textDisabled' : 'inherit'}
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

                            <TableCell align={"right"} colSpan={7}>

                                <Typography color={"secondary"}
                                            variant={"subtitle2"}>
                                    <strong> Загальна сумма закупівель: </strong> {totalPrice.toFixed(2)}
                                </Typography>

                            </TableCell>

                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            </div>
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
