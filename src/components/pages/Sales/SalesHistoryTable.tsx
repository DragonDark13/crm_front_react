import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    TextField,
    Button, MenuItem, Checkbox, InputLabel, FormControl, Select,
} from '@mui/material';
import {axiosInstance} from "../../../api/api";

// Типи для даних
interface Packaging {
    package_id: number;
    packaging_name: string;
    quantity_sold: number;
    unit_price: string;
    total_price: string;
}

interface Sale {
    sale_history_id: number;
    product_name: string;
    categories: { id: number; name: string }[];
    supplier: { id: number; name: string };
    customer: { id: number; name: string };
    quantity_sold: number;
    unit_price: string;
    total_price: string;
    sale_date: string;
    packaging_details: Packaging[];
}

const SalesHistoryTable: React.FC = () => {
    const [salesData, setSalesData] = useState<Sale[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('sale_date');
    const [searchProduct, setSearchProduct] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]); // Масив для категорій
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [expandedSale, setExpandedSale] = useState<number | null>(null); // Стан для відображення пакування

    useEffect(() => {
        // Завантаження даних з бекенду
        axiosInstance
            .get('/get_all_sales_history')
            .then((response) => {
                setSalesData(response.data);
            })
            .catch((error) => console.error('Error loading sales data:', error));
    }, []);

    // Функція для сортування таблиці
    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Функція для фільтрації
    const handleFilterChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, type: string) => {
        if (type === 'product') {
            setSearchProduct(event.target.value);
        } else if (type === 'date') {
            setSearchDate(event.target.value);
        }
    };

    const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string[];
        setCategoryFilters(value);
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
    };

    // Функція для відображення / приховування пакування
    const handleExpandClick = (saleId: number) => {
        if (expandedSale === saleId) {
            setExpandedSale(null); // Якщо вже відкрито, закриваємо
        } else {
            setExpandedSale(saleId); // Відкриваємо
        }
    };

    // Фільтрація та сортування даних
    const filteredSalesData = salesData
        .filter((sale) =>
            sale.product_name.toLowerCase().includes(searchProduct.toLowerCase()) &&
            sale.sale_date.includes(searchDate) &&
            (categoryFilters.length > 0 ? sale.categories.some(category => categoryFilters.includes(category.name)) : true) && // Перевірка категорій, тепер з `category.name`
            (startDate && endDate ? new Date(sale.sale_date) >= new Date(startDate) && new Date(sale.sale_date) <= new Date(endDate) : true)
        )
        .sort((a, b) => {
            // Сортування за назвою продукту
            if (orderBy === 'product_name') {
                return (a.product_name < b.product_name ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            // Сортування за загальною ціною
            else if (orderBy === 'total_price') {
                const aTotalPrice = parseFloat(a.total_price); // Перетворюємо на число
                const bTotalPrice = parseFloat(b.total_price); // Перетворюємо на число
                return (aTotalPrice < bTotalPrice ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            // Сортування за кількістю проданих одиниць
            else if (orderBy === 'quantity_sold') {
                return (a.quantity_sold < b.quantity_sold ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            // Сортування за датою продажу
            else if (orderBy === 'sale_date') {
                const aSaleDate = new Date(a.sale_date); // Перетворюємо рядок на об'єкт Date
                const bSaleDate = new Date(b.sale_date); // Перетворюємо рядок на об'єкт Date
                return (aSaleDate < bSaleDate ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            return 0;
        });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage); // Оновлюємо поточну сторінку
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10)); // Оновлюємо кількість рядків на сторінці
        setPage(0); // Скидаємо сторінку на першу, щоб не було порожніх місць при зменшенні кількості рядків
    };

    const columns = [
        {label: 'Назва продукту', field: 'product_name'},
        {label: 'Категорії', field: 'categories'},
        {label: 'Постачальник', field: 'supplier'},
        {label: 'Покупець', field: 'customer'},
        {label: 'Кількість закупленого', field: 'quantity_sold'},
        {label: 'Ціна за одиницю', field: 'unit_price'},
        {label: 'Загальна сума', field: 'total_price'},
        {label: 'Дата', field: 'sale_date'}
    ];

    // Рендеринг таблиці
    return (
        <div>
            <div>
                <TextField
                    label="Фільтрувати за товаром"
                    value={searchProduct}
                    onChange={(e) => handleFilterChange(e, 'product')}
                />
                <FormControl>
                    <InputLabel>Категорія</InputLabel>
                    <Select
                        multiple
                        value={categoryFilters}
                        onChange={handleCategoryChange}
                        label="Категорії"
                        renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                        {/* Можна замінити цей список на дані з API */}
                        <MenuItem value="Сувеніри">
                            <Checkbox checked={categoryFilters.indexOf('Сувеніри') > -1}/>
                            Сувеніри
                        </MenuItem>
                        <MenuItem value="Техніка">
                            <Checkbox checked={categoryFilters.indexOf('Техніка') > -1}/>
                            Техніка
                        </MenuItem>
                        <MenuItem value="Книги">
                            <Checkbox checked={categoryFilters.indexOf('Книги') > -1}/>
                            Книги
                        </MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Початкова дата"
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    InputLabelProps={{shrink: true}}
                />
                <TextField
                    label="Кінцева дата"
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    InputLabelProps={{shrink: true}}
                />
            </div>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell key={index}>
                                    <TableSortLabel
                                        active={orderBy === column.field}
                                        direction={orderBy === column.field ? sortOrder : 'asc'}
                                        onClick={() => handleRequestSort(column.field)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Дія</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSalesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale, index) => (
                            <React.Fragment key={index}>
                                <TableRow key={index}>
                                    <TableCell>{sale.product_name}</TableCell>
                                    <TableCell>{sale.categories.map((category) => category.name).join(', ')}</TableCell>
                                    <TableCell>{sale.supplier.name}</TableCell>
                                    <TableCell>{sale.customer.name}</TableCell>
                                    <TableCell>{sale.quantity_sold}</TableCell>
                                    <TableCell>{sale.unit_price}</TableCell>
                                    <TableCell>{sale.total_price}</TableCell>
                                    <TableCell>{sale.sale_date}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary"
                                                onClick={() => handleExpandClick(sale.sale_history_id)}>
                                            {expandedSale === sale.sale_history_id ? 'Сховати пакування' : 'Подивитися пакування'}
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {expandedSale === sale.sale_history_id && sale.packaging_details && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Назва пакування</TableCell>
                                                        <TableCell>Кількість проданого</TableCell>
                                                        <TableCell>Ціна за одиницю</TableCell>
                                                        <TableCell>Загальна сума</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {sale.packaging_details.length>0 ? sale.packaging_details.map((packaging, idx) => (
                                                        <TableRow key={idx}>
                                                            <TableCell>{packaging.packaging_name}</TableCell>
                                                            <TableCell>{packaging.quantity_sold}</TableCell>
                                                            <TableCell>{packaging.unit_price}</TableCell>
                                                            <TableCell>{packaging.total_price}</TableCell>
                                                        </TableRow>
                                                    ))
                                                        : (
                                                            <TableRow>
                                                                <TableCell colSpan={4}>Пакування відсутні</TableCell>
                                                            </TableRow>
                                                        )
                                                    }
                                                </TableBody>
                                            </Table>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSalesData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
};

export default SalesHistoryTable;
