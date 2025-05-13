import React, {forwardRef, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TableSortLabel, Box, TextField, TablePagination, Grid, Typography, TableFooter, MenuItem, Menu,
} from '@mui/material';
import {IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import HistoryIcon from '@mui/icons-material/History';
import {IProduct} from "../../utils/types";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface IProductTableProps {
    filteredProducts: IProduct[];
    order: 'asc' | 'desc';
    orderBy: keyof IProduct;
    handleSort: (property: keyof IProduct) => void;
    sortProducts: (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => IProduct[];
    getComparator: (order: 'asc' | 'desc', orderBy: keyof IProduct) => (a: IProduct, b: IProduct) => number;
    handleOpenEdit: (product: IProduct) => void;
    handleDelete: (productId: number) => void;
    handleOpenHistoryModal: (productId: number) => void;
    handlePurchase: (product: IProduct) => void;
    handleOpenSale: (product: IProduct) => void;
    searchTerm: string;
    filteredAndSearchedProducts: IProduct[]
    currentPage: number;
    itemsPerPage: number;
    selectedLowProductId: number,

}

import clsx from 'clsx'; // Бібліотека для зручної роботи з класами


const ProductTable: React.FC<IProductTableProps> = forwardRef(({
                                                                   filteredProducts,
                                                                   order,
                                                                   orderBy,
                                                                   handleSort,
                                                                   sortProducts,
                                                                   getComparator,
                                                                   handleOpenEdit,
                                                                   handleDelete,
                                                                   handlePurchase,
                                                                   handleOpenSale,
                                                                   handleOpenHistoryModal,
                                                                   searchTerm,
                                                                   filteredAndSearchedProducts,
                                                                   itemsPerPage,
                                                                   currentPage,
                                                                   selectedLowProductId,
                                                                   isAuthenticated
                                                               }, ref) => {

// Підрахунок загальної кількості та суми для закупівлі та продажу
    const totalQuantityPurchaseAllTime = filteredAndSearchedProducts.reduce((sum, product) => sum + product.total_quantity, 0);

    const totalQuantityPurchase = filteredAndSearchedProducts.reduce((sum, product) => sum + product.available_quantity, 0);
    const totalSumPurchase = isAuthenticated
        ? filteredAndSearchedProducts.reduce((sum, product) => sum + (product.total_quantity * product.purchase_price_per_item), 0) // Загальна сума закупівель
        : 0; // Сума закупівлі тільки для залогінених

    const totalQuantitySelling = filteredAndSearchedProducts.reduce((sum, product) => sum + product.sold_quantity, 0);
    const totalSumSelling = filteredAndSearchedProducts.reduce((sum, product) => sum + (product.sold_quantity * product.selling_price_per_item), 0);

    // Розрахункова сума продажу (оскільки наявність продукції може змінюватися)
    const totalCalculatedSellingSum = filteredAndSearchedProducts.reduce((sum, product) => sum + (product.available_quantity * product.selling_price_per_item), 0);
    // Розрахункова сума закупівель (оскільки наявність продукці�� може змінюватися)
    const [selectedProduct, setSelectedProduct] = useState(null); // Додаємо стан для зберігання вибраного товару

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event, product) => {
        setAnchorEl(event.currentTarget);
        setSelectedProduct(product);  // Встановлюємо обраний товар

    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedProduct(null);  // Очищаємо вибір товару при закритті меню

    };


    return (
        <React.Fragment>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{display: "none"}}>ID</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'name'}
                                    direction={orderBy === 'name' ? order : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    Назва
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'supplier'}
                                    direction={orderBy === 'supplier' ? order : 'asc'}
                                    onClick={() => handleSort('supplier')}
                                >
                                    Постачальник
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'quantity'}
                                    direction={orderBy === 'quantity' ? order : 'asc'}
                                    onClick={() => handleSort('quantity')}
                                >
                                    Кількість

                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'purchase_price_per_item'}
                                    direction={orderBy === 'purchase_price_per_item' ? order : 'asc'}
                                    onClick={() => handleSort('purchase_price_per_item')}
                                >
                                    <div>
                                        <Typography> Ціна за 1шт
                                        </Typography>
                                        <Typography color={"secondary"}>
                                            Закупка
                                        </Typography>
                                        <Typography color={"primary"}>
                                            Продаж
                                        </Typography></div>
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'purchase_total_price'}
                                    direction={orderBy === 'purchase_total_price' ? order : 'asc'}
                                    onClick={() => handleSort('purchase_total_price')}
                                >
                                    <div>
                                        Сумма
                                        <Typography color={"secondary"}>
                                            Закупка
                                        </Typography>
                                        <Typography color={"primary"}>
                                            Продаж
                                        </Typography>
                                    </div>
                                </TableSortLabel>
                            </TableCell>

                            <TableCell align={"right"}>Дія</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSearchedProducts.length >= 0 &&
                        sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy))
                            .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
                            .map((product: IProduct, index) => {
                                const lowQuantity = product.total_quantity < 5; // умова для низької кількості
                                return (
                                    <TableRow key={`${product.id}${index}${product.purchase_total_price}`}
                                              ref={el => {
                                                  if (ref && typeof ref === 'function') {
                                                      ref(el, index + currentPage * itemsPerPage);
                                                  } else if (ref && ref.current) {
                                                      ref.current[index + currentPage * itemsPerPage] = el;
                                                  }
                                              }}
                                              className={clsx({'low-quantity-row': lowQuantity}, {'selected-row': selectedLowProductId === product.id})}>
                                        <TableCell sx={{display: "none"}}>
                                            {product.id}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant={"subtitle2"}>
                                                {product.name}
                                            </Typography>

                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}
                                                className={clsx("supplier_name")}
                                                title={product.supplier?.name || 'N/A'}
                                                sx={{
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                {product.supplier?.name || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <div><Box display="flex" alignItems="center" gap={2}>
                                                <Tooltip title="Загальна кількість товару">
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
                                                            {product.total_quantity}
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
                                                                backgroundColor: lowQuantity ? "error.main" : "secondary.dark",
                                                                color: "white",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {product.available_quantity}
                                                        </Box>
                                                    </Box>
                                                </Tooltip>

                                                <Tooltip title="Кількість проданого товару">
                                                    <Box display="flex" alignItems="center" gap={1}>

                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: "50%",
                                                                backgroundColor: "primary.main",
                                                                color: "white",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {product.sold_quantity}
                                                        </Box>
                                                    </Box>
                                                </Tooltip>
                                            </Box></div>
                                        </TableCell>
                                        <TableCell>
                                            {isAuthenticated && (
                                                <Typography color={"secondary"} variant={"subtitle2"}>
                                                    {product.purchase_price_per_item.toFixed(2)}
                                                </Typography>
                                            )}
                                            <Typography color={"primary"} variant={"subtitle2"}>
                                                {product.selling_price_per_item.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {isAuthenticated && (
                                                <Typography color={"secondary"} variant={"subtitle2"}>
                                                    {(product.purchase_total_price).toFixed(2)}
                                                </Typography>
                                            )}
                                            <Typography color={"primary"} variant={"subtitle2"}>
                                                {(product.sold_quantity * product.selling_price_per_item).toFixed(2)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align={"right"}>
                                            <Tooltip title="Дії">
                                                <IconButton id="demo-positioned-button"
                                                            onClick={(event => handleClick(event, product))}>
                                                    <MoreVertIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Menu PaperProps={{
                                                elevation: 1
                                            }}
                                                  aria-labelledby="demo-positioned-button"
                                                  anchorEl={anchorEl}
                                                  anchorOrigin={{
                                                      vertical: 'top',
                                                      horizontal: 'right',
                                                  }}
                                                  transformOrigin={{
                                                      vertical: 'top',
                                                      horizontal: 'right',
                                                  }}

                                                  open={open} onClose={handleClose}>
                                                <MenuItem onClick={() => {
                                                    handleOpenEdit(selectedProduct);  // Використовуємо selectedProduct
                                                    handleClose();
                                                }} >
                                                    <EditIcon color="primary" fontSize="small" sx={{mr: 1}}/> Редагувати
                                                </MenuItem>
                                                <MenuItem onClick={() => {
                                                    handlePurchase(selectedProduct);  // Використовуємо selectedProduct
                                                    handleClose();
                                                }} >
                                                    <ShoppingCartIcon color="primary" fontSize="small"
                                                                      sx={{mr: 1}}/> Купівля
                                                </MenuItem>
                                                <MenuItem onClick={() => {
                                                    handleOpenSale(selectedProduct);  // Використовуємо selectedProduct
                                                    handleClose();
                                                }} >
                                                    <SellIcon color="primary" fontSize="small" sx={{mr: 1}}/> Продаж
                                                </MenuItem>
                                                <MenuItem onClick={() => {
                                                    handleOpenHistoryModal(selectedProduct.id);  // Використовуємо selectedProduct
                                                    handleClose();
                                                }}>
                                                    <HistoryIcon fontSize="small" sx={{mr: 1}}/> Історія
                                                </MenuItem>
                                                <MenuItem onClick={() => {
                                                    handleDelete(selectedProduct.id);  // Використовуємо selectedProduct
                                                    handleClose();
                                                }} disabled={!isAuthenticated}>
                                                    <DeleteIcon fontSize="small" sx={{mr: 1}} color="error"/> Видалити
                                                </MenuItem>
                                            </Menu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3} align="right"><strong>Загальна кількість:</strong></TableCell>
                            <TableCell>
                                <Typography variant={"subtitle2"} color={"secondary"}>
                                    <strong> За весь час</strong> {totalQuantityPurchaseAllTime}
                                </Typography><Typography variant={"subtitle2"} color={"secondary"}>
                                <strong> Загальна кількість у наявності</strong> {totalQuantityPurchase}
                            </Typography>
                                <Typography variant={"subtitle2"} color={"primary"}>
                                    <strong> Продано</strong> {totalQuantitySelling}
                                </Typography>
                            </TableCell>
                            <TableCell colSpan={1} align="right"><strong>Загальна сума:</strong></TableCell>
                            <TableCell>
                                <Typography color={"secondary"}
                                            variant={"subtitle2"}>
                                    <strong> Закупівель: </strong> {totalSumPurchase.toFixed(2)}
                                </Typography>
                                <Typography color={"primary"}
                                            variant={"subtitle2"}>
                                    <strong> Проданого: </strong>
                                    {totalSumSelling.toFixed(2)}
                                </Typography>

                                {/*<Typography color={"primary"}*/}
                                {/*            variant={"subtitle2"}>*/}
                                {/*    <strong>залишку: </strong>*/}
                                {/*    {totalCalculatedSellingSum.toFixed(2)}*/}
                                {/*</Typography>*/}
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
});

export default ProductTable;
