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
    Grid, Slider, Collapse, Tooltip
} from '@mui/material';
import {axiosInstance} from "../../../api/api";
import clsx from "clsx";
import {ICategory} from "../../../utils/types";
import {useCategories} from "../../Provider/CategoryContext";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Товар
import AllInboxIcon from '@mui/icons-material/AllInbox';     // Пакування
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {AttachMoney, Luggage, ShoppingBag} from "@mui/icons-material";   // Інше

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
    const [priceRangeFilterSlider, setPriceRangeFilterSlider] = useState<number[]>([0, 0]);

    const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
    const [typeFilter, setTypeFilter] = useState<string | ''>('');  // Додано фільтр по типу
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtersOpen, setFiltersOpen] = useState(false);

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

            const prices = formattedData
                .map((item) => parseFloat(item.price_per_item))
                .filter((price) => !isNaN(price));

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

    return (
        <div>
            <Typography marginBlockEnd={3} variant={"h4"}>Історія Закупівель</Typography>

            <Button
                startIcon={filtersOpen ? <FilterListOffIcon/> : <FilterListIcon/>}
                variant="outlined"
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{marginBottom: '10px'}}
            >
                {filtersOpen ? 'Сховати фільтри' : 'Показати фільтри'}
            </Button>
            <Collapse in={filtersOpen}>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={5}>
                        <TextField
                            placeholder={'Назва'}
                            size={"small"}
                            margin="dense"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            label="Пошук"
                            variant="outlined"
                            fullWidth
                            value={filter}
                            onChange={handleFilterChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <TextField
                            size={"small"}
                            margin="dense"
                            label="Дата початку"
                            type="date"
                            fullWidth
                            value={dateRangeFilter.start}
                            onChange={(e) => handleDateRangeFilterChange('start', e.target.value)}
                            InputLabelProps={{shrink: true}}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            size={"small"}
                            margin="dense"
                            label="Дата закінчення"
                            type="date"
                            fullWidth
                            value={dateRangeFilter.end}
                            onChange={(e) => handleDateRangeFilterChange('end', e.target.value)}
                            inputProps={{
                                min: dateRangeFilter.start || undefined  // заборонити дати до початкової
                            }}
                            InputLabelProps={{shrink: true, min: dateRangeFilter.start,}}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl size={"small"} fullWidth margin={"dense"}>
                            <InputLabel size={"small"}>Категорія</InputLabel>
                            <Select size={"small"} label={'Категорія'} value={categoryFilter}
                                    onChange={handleCategoryFilterChange}>
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
                        <FormControl size={"small"} fullWidth margin={"dense"}>
                            <InputLabel size={"small"}>Постачальник</InputLabel>
                            <Select size={"small"} label={'Постачальник'} value={supplierFilter}
                                    onChange={handleSupplierFilterChange}>
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
                        <FormControl size={"small"} fullWidth margin={"dense"}>
                            <InputLabel size={"small"}>Тип</InputLabel>
                            <Select size={"small"} label={'Тип'} value={typeFilter} onChange={handleTypeFilterChange}>
                                <MenuItem value="">Всі типи</MenuItem>
                                <MenuItem value="Other Investment">Інші інвестиції</MenuItem>
                                <MenuItem value="Packaging">Упаковка</MenuItem>
                                <MenuItem value="Product">Продукт</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={5}>
                        <Grid container alignItems={"center"}>
                            <Grid item xs={12} md={4}><Typography variant={"caption"} gutterBottom>Діапазон ціни (за
                                од.):</Typography></Grid>
                            <Grid item xs={12} md={8}>
                                <Box px={"10px"}>
                                    {Number.isFinite(priceBounds[0]) && Number.isFinite(priceBounds[1]) && (<Slider
                                        value={priceRangeFilterSlider} // <- має бути масив: [min, max]
                                        onChange={(_, newValue) => {
                                            setPriceRangeFilterSlider(newValue as number[]);
                                        }}
                                        valueLabelDisplay="auto"

                                        min={priceBounds[0]}
                                        max={priceBounds[1]}
                                        marks={[
                                            {value: priceBounds[0], label: `${priceBounds[0]}₴`},
                                            {value: priceBounds[1], label: `${priceBounds[1]}₴`}
                                        ]}
                                    />)} </Box></Grid>
                        </Grid>


                    </Grid>

                </Grid>
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
                                <Typography> Тип</Typography>
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
                                    <Tooltip title={
                                        row.type === "Product" ? "Товар" :
                                            row.type === "Packaging" ? "Пакування" : "Інше"
                                    }>
                                        <Typography variant="subtitle2" component="span">
                                            {row.type === "Product" && <Tooltip title="Товар">
                                                <ShoppingBag fontSize="small"/>
                                            </Tooltip>
                                            }
                                            {row.type === "Packaging" &&
                                            <Tooltip title="Пакування">
                                                <Luggage fontSize="small"/>
                                            </Tooltip>
                                            }
                                            {row.type === "Other Investment" &&
                                            <Tooltip title="Інші вкладення">
                                                <AttachMoney fontSize="small"/>
                                            </Tooltip>
                                            }
                                        </Typography>

                                    </Tooltip>
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
