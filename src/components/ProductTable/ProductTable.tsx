// ProductTable.tsx

import React, {forwardRef, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TableSortLabel, Box, TextField, TablePagination, Grid, Typography, TableFooter,
} from '@mui/material';
import {IconButton, Tooltip} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import HistoryIcon from '@mui/icons-material/History';
import {IProduct} from "../../utils/types";

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

    // Підрахунок загальної кількості та суми
    // Підрахунок загальної кількості та суми
    const totalQuantityPurchase = filteredAndSearchedProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalSumPurchase = isAuthenticated
        ? filteredAndSearchedProducts.reduce((sum, product) => sum + product.purchase_total_price, 0)
        : 0; // Сума закупівельна тільки для залогінених

    const totalQuantitySelling = filteredAndSearchedProducts.reduce((sum, product) => sum + product.selling_quantity, 0);
    const totalSumSelling = filteredAndSearchedProducts.reduce((sum, product) => sum + product.selling_total_price, 0);


    return (
        <React.Fragment>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
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

                            <TableCell>Дія</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSearchedProducts.length >= 0 &&
                        sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy))
                            .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
                            .map((product: IProduct, index) => {
                                const lowQuantity = product.quantity < 5; // умова для низької кількості
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
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.supplier?.name || 'N/A'}</TableCell>
                                        <TableCell
                                        > <Typography
                                            className={clsx(
                                                {'low-quantity': lowQuantity},
                                            )}>
                                            {product.quantity}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            {isAuthenticated && (
                                                <Typography color={"secondary"}>
                                                    {product.purchase_price_per_item.toFixed(2)}
                                                </Typography>
                                            )}
                                            <Typography color={"primary"}>
                                                {product.selling_price_per_item.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {isAuthenticated && (
                                                <Typography color={"secondary"}>
                                                    {product.purchase_total_price.toFixed(2)}
                                                </Typography>
                                            )}
                                            <Typography color={"primary"}>
                                                {product.selling_total_price.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display={"flex"}>
                                                <Tooltip title="Редагувати">
                                                    <IconButton disabled={!isAuthenticated} color="primary"
                                                                onClick={() => handleOpenEdit(product)}>
                                                        <EditIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Видалити">
                                                    <IconButton disabled={!isAuthenticated} color="secondary"
                                                                onClick={() => handleDelete(product.id)}>
                                                        <DeleteIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Купівля">
                                                    <IconButton disabled={!isAuthenticated} color="primary"
                                                                onClick={() => handlePurchase(product)}>
                                                        <ShoppingCartIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Продаж">
                                                    <IconButton disabled={!isAuthenticated} color="primary"
                                                                onClick={() => handleOpenSale(product)}>
                                                        <SellIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Історія">
                                                    <IconButton size={"small"} onClick={() => {
                                                        handleOpenHistoryModal(product.id);
                                                    }}>
                                                        <HistoryIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
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
                                    {totalQuantityPurchase}
                                </Typography>
                                <Typography variant={"subtitle2"} color={"primary"}>
                                    {totalQuantitySelling}
                                </Typography>
                            </TableCell>
                            <TableCell colSpan={1} align="right"><strong>Загальна сума:</strong></TableCell>
                            <TableCell>
                                <Typography
                                    color={"secondary"}
                                    variant={"subtitle2"}>{totalSumPurchase.toFixed(2)}
                                </Typography>
                                <Typography
                                    color={"primary"}
                                    variant={"subtitle2"}>{totalSumSelling.toFixed(2)}
                                </Typography>

                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </React.Fragment>
    );
});

export default ProductTable;
