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
    TableSortLabel, TextField, FormControl, Select, MenuItem, InputLabel, Box, TablePagination, TableFooter, Button
} from '@mui/material';
import {axiosInstance} from "../../../api/api";
import clsx from "clsx";
import {ICategory} from "../../../utils/types";
import {useCategories} from "../../Provider/CategoryContext";


interface IPurchasesTable {
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

    const resetFilters = () => {
        setFilter('');
        setDateRangeFilter({start: '', end: ''});
        setCategoryFilter('');
        setSupplierFilter('');
        setPriceRangeFilter({min: '', max: ''});
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
            ? item.product_categories.includes(categoryFilter)
            : true;

        const matchesSupplier = supplierFilter
            ? item.supplier_name === supplierFilter
            : true;

        const matchesPriceRange =
            (priceRangeFilter.min === '' || item.price_per_item >= parseFloat(priceRangeFilter.min)) &&
            (priceRangeFilter.max === '' || item.price_per_item <= parseFloat(priceRangeFilter.max));

        return (
            matchesSearch && matchesDateRange && matchesCategory && matchesSupplier && matchesPriceRange
        );
    });

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = filteredData.reduce((sum, item) => sum + item.total_price, 0);

    return (
        <div>
            <h1>Purchase History</h1>
            <TextField
                label="Search"
                variant="outlined"
                fullWidth
                margin="normal"
                value={filter}
                onChange={handleFilterChange}
            />
            <Box display="flex" gap={2} marginBottom={2}>
                <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={dateRangeFilter.start}
                    onChange={(e) => handleDateRangeFilterChange('start', e.target.value)}
                    InputLabelProps={{shrink: true}}
                />
                <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    value={dateRangeFilter.end}
                    onChange={(e) => handleDateRangeFilterChange('end', e.target.value)}
                    InputLabelProps={{shrink: true}}
                />
            </Box>
            <FormControl fullWidth margin="normal">
                <InputLabel>Filter by Category</InputLabel>
                <Select value={categoryFilter} onChange={handleCategoryFilterChange}>
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category: ICategory) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Filter by Supplier</InputLabel>
                <Select value={supplierFilter} onChange={handleSupplierFilterChange}>
                    <MenuItem value="">All Suppliers</MenuItem>
                    {Array.from(new Set(purchaseHistory.map((item) => item.supplier_name))).map(
                        (supplier, index) => (
                            <MenuItem key={supplier + `${index}`} value={supplier}>
                                {supplier}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>
            <TextField
                label="Min Price"
                type="number"
                margin="normal"
                value={priceRangeFilter.min}
                onChange={(e) => handlePriceRangeFilterChange('min', e.target.value)}
            />
            <TextField
                label="Max Price"
                type="number"
                margin="normal"
                value={priceRangeFilter.max}
                onChange={(e) => handlePriceRangeFilterChange('max', e.target.value)}
            />
            <Box marginY={2}>
                <Button variant="contained" color="primary" onClick={resetFilters}>
                    Reset Filters
                </Button>
            </Box>

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
                                <TableSortLabel
                                    active={sortConfig.key === 'name'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('name')}
                                >
                                    Product Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'supplier_name'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('supplier_name')}
                                >
                                    Supplier Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'quantity'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('quantity')}
                                >
                                    Quantity
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'price_per_item'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('price_per_item')}
                                >
                                    Price per Item
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'total_price'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('total_price')}
                                >
                                    Total Price
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'date'}
                                    direction={sortConfig.direction}
                                    onClick={() => handleSort('date')}
                                >
                                    Date
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row, index) => (
                            <TableRow key={index + row.name}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>
                                    <Typography
                                        className={clsx("supplier_name")}
                                        title={row.supplier_name}
                                        sx={{
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                        {row.supplier_name}
                                    </Typography>
                                </TableCell>
                                <TableCell>{row.quantity ? row.quantity : "Загалом"}</TableCell>
                                <TableCell>{row.price_per_item ? row.price_per_item.toFixed(2) : "Загалом"}</TableCell>
                                <TableCell>{row.total_price.toFixed(2)}</TableCell>
                                <TableCell>{row.date}</TableCell>
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
