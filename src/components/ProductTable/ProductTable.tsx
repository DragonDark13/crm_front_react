// ProductTable.tsx

import React, {forwardRef, useState} from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, TableSortLabel, Box, TextField, TablePagination, Grid, Typography,
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

}

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
                                                               }, ref) => {


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
                                    active={orderBy === 'price_per_item'}
                                    direction={orderBy === 'price_per_item' ? order : 'asc'}
                                    onClick={() => handleSort('price_per_item')}
                                >
                                    Ціна за 1шт
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'total_price'}
                                    direction={orderBy === 'total_price' ? order : 'asc'}
                                    onClick={() => handleSort('total_price')}
                                >
                                    Сумма
                                </TableSortLabel>
                            </TableCell>

                            <TableCell>Дія</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSearchedProducts.length > 0 &&
                        sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy))
                            .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
                            .map((product: IProduct, index) => {
                                const lowQuantity = product.quantity < 5; // умова для низької кількості
                                return (
                                    <TableRow key={`${product.id}${index}${product.total_price}`}
                                              ref={el => {
                                                  if (ref && typeof ref === 'function') {
                                                      ref(el, index + currentPage * itemsPerPage);
                                                  } else if (ref && ref.current) {
                                                      ref.current[index + currentPage * itemsPerPage] = el;
                                                  }
                                              }}
                                              className={lowQuantity ? 'low-quantity-row' : ''}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.supplier?.name || 'N/A'}</TableCell>
                                        <TableCell
                                        > <Typography
                                            className={lowQuantity ? 'low-quantity' : ''}>{product.quantity}</Typography></TableCell>
                                        <TableCell>
                                            {product.price_per_item}
                                        </TableCell>
                                        <TableCell>{product.total_price}</TableCell>
                                        <TableCell>
                                            <Box display={"flex"}>
                                                <Tooltip title="Редагувати">
                                                    <IconButton color="primary" onClick={() => handleOpenEdit(product)}>
                                                        <EditIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Видалити">
                                                    <IconButton color="secondary"
                                                                onClick={() => handleDelete(product.id)}>
                                                        <DeleteIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Купівля">
                                                    <IconButton color="primary" onClick={() => handlePurchase(product)}>
                                                        <ShoppingCartIcon fontSize={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Продаж">
                                                    <IconButton color="primary" onClick={() => handleOpenSale(product)}>
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
                </Table>
            </TableContainer>
        </React.Fragment>
    );
});

export default ProductTable;
