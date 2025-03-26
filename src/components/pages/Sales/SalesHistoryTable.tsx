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
    Button, MenuItem, Checkbox, InputLabel, FormControl, Select, Tooltip, IconButton, Collapse, Box, Modal, Paper,
} from '@mui/material';
import {axiosInstance} from "../../../api/api";
import {ShoppingBag, Inventory, CardGiftcard, Info, ExpandMore, Luggage} from "@mui/icons-material";


// Інтерфейс для постачальника
interface Supplier {
    id: number;
    name: string;
}

// Інтерфейс для пакування
interface Packaging {
    package_id: any;
    quantity: number;
    supplier: Supplier;  // Постачальник може бути або об'єктом, або рядком
    packaging_id: number;
    packaging_name: string;
    quantity_sold: number;
    unit_price: string;
    total_price: string;
}

// Інтерфейс для продукту
interface Product {
    quantity: number;
    product_id: number;
    name: string;
    quantity_sold: number;
    unit_price: string;
    total_price: string;
    supplier: Supplier;
}

// Основний інтерфейс для даних про продаж
interface Sale {
    packagings: Packaging[];  // Список пакувань
    products: Product[];  // Список продуктів
    cost_price: number;  // Собівартість продажу
    profit: number;  // Вигода (прибуток)
    gift_set_name: string;  // Назва подарункового набору
    sale_history_id: number;  // Ідентифікатор історії продажу
    product_name: string;  // Назва продукту чи набору
    categories: { id: number; name: string }[];  // Категорії товарів
    supplier: Supplier;  // Постачальник
    customer: { id: number; name: string };  // Інформація про покупця
    quantity_sold: number;  // Кількість проданого
    unit_price: string;  // Ціна за одиницю
    total_price: string;  // Загальна ціна продажу
    sale_date: string;  // Дата продажу
    packaging_details: Packaging[];  // Деталі пакування
    type: string;  // Тип продажу: 'product' або 'gift_set'
}


const SalesHistoryTable: React.FC = () => {
    const [salesData, setSalesData] = useState<Sale[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('sale_date');
    const [searchProduct, setSearchProduct] = useState<string>('');
    const [searchDate, setSearchDate] = useState<string>('');
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [expandedSale, setExpandedSale] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    useEffect(() => {
        axiosInstance
            .get('/get_all_sales_history')
            .then((response) => {
                setSalesData(response.data);
            })
            .catch((error) => console.error('Error loading sales data:', error));
    }, []);

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

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

    const handleExpandClick = (saleId: number) => {
        setExpandedSale(expandedSale === saleId ? null : saleId);
    };

    const handleModalOpen = (sale: Sale) => {
        setSelectedSale(sale);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedSale(null);
    };


    const filteredSalesData = salesData
        .filter((sale) => {
            // Перевіряємо назву продукту або набору
            const productOrGiftSetName = sale.product_name || sale.gift_set_name || '';

            return (
                productOrGiftSetName.toLowerCase().includes(searchProduct.toLowerCase()) && // Фільтрація за продуктом або набором
                sale.sale_date.includes(searchDate) &&
                (categoryFilters.length > 0
                    ? sale.categories.some(category => categoryFilters.includes(category.name))
                    : true) &&
                (startDate && endDate
                    ? new Date(sale.sale_date) >= new Date(startDate) && new Date(sale.sale_date) <= new Date(endDate)
                    : true)
            );
        })
        .sort((a, b) => {
            if (orderBy === 'product_name') {
                const nameA = a.product_name || a.gift_set_name;
                const nameB = b.product_name || b.gift_set_name;
                return (nameA < nameB ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            if (orderBy === 'total_price') {
                return (parseFloat(a.total_price) < parseFloat(b.total_price) ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            if (orderBy === 'quantity_sold') {
                return (a.quantity_sold < b.quantity_sold ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
            }
            return 0;
        });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getSaleIcon = (type) => {
        switch (type) {
            case "product":
                return (
                    <Tooltip title="Одиничний товар">
                        <ShoppingBag fontSize={"small"} color="primary"/>
                    </Tooltip>
                );
            case "product_with_packaging":
                return (
                    <Tooltip title="Товар з пакуванням">
                        <Inventory fontSize={"small"} color="secondary"/>
                    </Tooltip>
                );
            case "gift_set":
                return (
                    <Tooltip title="Подарунковий набір">
                        <CardGiftcard fontSize={"small"} color="success"/>
                    </Tooltip>
                );
            default:
                return (
                    <Tooltip title="Невідомий тип">
                        <ShoppingBag fontSize={"small"}/>
                    </Tooltip>
                );
        }
    };


    return (
        <div>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSalesData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <TableContainer component={Paper} style={{marginTop: '20px'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Тип</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'product_name'}
                                    direction={orderBy === 'product_name' ? sortOrder : 'asc'}
                                    onClick={() => handleRequestSort('product_name')}
                                >
                                    Назва
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Покупець</TableCell> {/* Додаємо колонку для покупця */}
                            {/*<TableCell>Quantity Sold</TableCell>*/}
                            {/*<TableCell>Ціна за од</TableCell>*/}
                            <TableCell>Сумма</TableCell>
                            <TableCell>Собівартість</TableCell>
                            <TableCell>Вигода</TableCell>
                            <TableCell>Sale Date</TableCell>
                            <TableCell>Дії</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSalesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
                            <React.Fragment key={sale.sale_history_id}>
                                <TableRow>
                                    <TableCell size={"small"}>{getSaleIcon(sale.type)}</TableCell>
                                    <TableCell
                                        size={"small"}>{sale.type === "product_with_packaging" && sale.packaging_details.length > 0
                                        ? `${sale.product_name} + ${sale.packaging_details[0].packaging_name}`
                                        : sale.product_name}</TableCell>
                                    <TableCell>{sale.customer.name}</TableCell>

                                    {/*<TableCell size={"small"}>{sale.quantity_sold}</TableCell>*/}
                                    {/*<TableCell size={"small"}>{sale.unit_price}</TableCell>*/}
                                    <TableCell size={"small"}>{sale.total_price}</TableCell>
                                    <TableCell size={"small"}>{sale.cost_price}</TableCell>
                                    <TableCell size={"small"}>{sale.profit}</TableCell>
                                    <TableCell size={"small"}>{sale.sale_date}</TableCell>
                                    <TableCell>

                                        <IconButton onClick={() => handleExpandClick(sale.sale_history_id)}>
                                            <ExpandMore/>
                                        </IconButton>
                                        <IconButton onClick={() => handleModalOpen(sale)}>
                                            <Tooltip title="Інформація">
                                                <Info/>
                                            </Tooltip>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                {(expandedSale === sale.sale_history_id) && (sale.type === 'gift_set'
                                    ?
                                    (<TableRow>
                                        <TableCell colSpan={7}>
                                            <Collapse in={expandedSale === sale.sale_history_id} timeout="auto"
                                                      unmountOnExit>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Тип</TableCell>
                                                            <TableCell>Назва</TableCell>
                                                            <TableCell>Постачальник</TableCell>
                                                            <TableCell>Ціна за од.</TableCell>
                                                            <TableCell>Кількість</TableCell>
                                                            <TableCell>Сума</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {sale.products && sale.products.map((product) => (
                                                            <TableRow key={product.product_id}>
                                                                <TableCell>
                                                                    <Tooltip title="Одиничний товар">
                                                                        <ShoppingBag fontSize={"small"}
                                                                        />
                                                                    </Tooltip>
                                                                </TableCell>
                                                                <TableCell>{product.name}</TableCell>
                                                                <TableCell>{product.supplier.name}</TableCell>
                                                                <TableCell>{product.unit_price}</TableCell>
                                                                <TableCell>{product.quantity}</TableCell>
                                                                <TableCell>{product.total_price}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {sale.packagings && sale.packagings.map((packaging) => (
                                                            <TableRow key={packaging.packaging_id}>
                                                                <TableCell>
                                                                    <Tooltip title="Пакування">
                                                                        <Luggage fontSize={"small"}/>
                                                                    </Tooltip>
                                                                </TableCell>
                                                                <TableCell>{packaging.packaging_name}</TableCell>
                                                                <TableCell>{packaging.supplier.name}</TableCell>
                                                                <TableCell>{packaging.unit_price}</TableCell>
                                                                <TableCell>{packaging.quantity}</TableCell>
                                                                <TableCell>{packaging.total_price}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>)
                                    :
                                    (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Collapse in={expandedSale === sale.sale_history_id} timeout="auto"
                                                          unmountOnExit>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Тип</TableCell>
                                                                <TableCell>Назва</TableCell>
                                                                <TableCell>Постачальник</TableCell>
                                                                <TableCell>Ціна за од.</TableCell>
                                                                <TableCell>Кількість</TableCell>
                                                                <TableCell>Сума</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {/* Основний товар */}
                                                            <TableRow>
                                                                <TableCell>Товар</TableCell>
                                                                <TableCell>{sale.product_name}</TableCell>
                                                                <TableCell>{sale.supplier?.name || 'Невідомо'}</TableCell>
                                                                <TableCell>{sale.unit_price}</TableCell>
                                                                <TableCell>{sale.quantity_sold}</TableCell>
                                                                <TableCell>{sale.total_price}</TableCell>
                                                            </TableRow>

                                                            {/* Пакування (якщо є) */}
                                                            {sale.packaging_details && sale.packaging_details.length > 0 && (
                                                                sale.packaging_details.map(packaging => (
                                                                    <TableRow key={packaging.package_id}>
                                                                        <TableCell>Пакування</TableCell>
                                                                        <TableCell>{packaging.packaging_name}</TableCell>
                                                                        <TableCell>{packaging.supplier?.name || 'Невідомо'}</TableCell>
                                                                        <TableCell>{packaging.unit_price}</TableCell>
                                                                        <TableCell>{packaging.quantity_sold}</TableCell>
                                                                        <TableCell>{packaging.total_price}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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

            <Modal open={modalOpen} onClose={handleModalClose}>
                <Box sx={{width: 400, backgroundColor: 'white', padding: 2, margin: 'auto', mt: 10}}>
                    <h2>Інформація про продаж</h2>
                    {selectedSale && (
                        <>
                            <p><strong>Назва:</strong> {selectedSale.product_name}</p>
                            <p><strong>Кількість:</strong> {selectedSale.quantity_sold}</p>
                            <p><strong>Ціна:</strong> {selectedSale.unit_price}</p>
                            <p><strong>Сума:</strong> {selectedSale.total_price}</p>
                            <p><strong>Дата:</strong> {selectedSale.sale_date}</p>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default SalesHistoryTable;
