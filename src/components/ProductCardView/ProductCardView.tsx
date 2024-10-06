import React, {useState} from 'react';
import {
    Card, CardContent, Typography, Grid, Box, TextField, IconButton, Tooltip, TablePagination
} from '@mui/material';
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

const ProductCardView: React.FC<IProductTableProps> = ({
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
                                                           currentPage,
                                                           itemsPerPage
                                                       }) => {


    return (
        <React.Fragment>

            <Grid container spacing={2}>
                {filteredAndSearchedProducts.length > 0 &&
                sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy))
                    .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
                    .map((product: IProduct, index) => (
                        <Grid item xs={12} sm={6} md={4} key={`${product.id}${index}${product.purchase_total_price}`}>
                            <Card>
                                <CardContent>
                                    {/* Заголовок товару */}
                                    <Typography variant="h5" gutterBottom fontWeight="bold">
                                        {product.name}
                                    </Typography>

                                    {/* Інформація про товар */}
                                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                        ID: <Typography component="span" variant="body1"
                                                        color="textPrimary">{product.id}</Typography>
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                        Постачальник: <Typography component="span" variant="body1"
                                                                  color="textPrimary">{product.supplier?.name || 'N/A'}</Typography>
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                        Кількість: <Typography component="span" variant="body1"
                                                               color="textPrimary">{product.quantity}</Typography>
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                        Ціна за 1 шт: <Typography component="span" variant="body1"
                                                                  color="textPrimary">{product.purchase_price_per_item}</Typography>
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                                        Сума: <Typography component="span" variant="body1"
                                                          color="textPrimary">{product.purchase_total_price}</Typography>
                                    </Typography>

                                    {/* Блок з кнопками */}
                                    <Box mt={2} display="flex" justifyContent="space-between">
                                        <Tooltip title="Редагувати">
                                            <IconButton color="primary" onClick={() => handleOpenEdit(product)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Видалити">
                                            <IconButton color="error" onClick={() => handleDelete(product.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Купівля">
                                            <IconButton color="success" onClick={() => handlePurchase(product)}>
                                                <ShoppingCartIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Продаж">
                                            <IconButton color="warning" onClick={() => handleOpenSale(product)}>
                                                <SellIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Історія">
                                            <IconButton color="info" onClick={() => handleOpenHistoryModal(product.id)}>
                                                <HistoryIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
            </Grid>

        </React.Fragment>
    );
};

export default ProductCardView;
