import React, {useState} from 'react';
import {
    Card, CardContent, Typography, Grid, Box, TextField, IconButton, Tooltip, TablePagination, TableCell,
    Button, Chip, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory2';
import {IProduct} from "../../utils/types";
import ProductImage from "../ProductImage/ProductImage";

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
    handleOpenInventory: (product: IProduct) => void;
    handlePurchase: (product: IProduct) => void;
    handleOpenSale: (product: IProduct) => void;
    searchTerm: string;
    filteredAndSearchedProducts: IProduct[];
    currentPage: number;
    itemsPerPage: number;
    isAuthenticated: boolean; // Додано поле для перевірки авторизації
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
                                                           handleOpenInventory,
                                                           searchTerm,
                                                           filteredAndSearchedProducts,
                                                           currentPage,
                                                           itemsPerPage,
                                                           isAuthenticated // Отримуємо статус авторизації
                                                       }) => {

    return (
        <React.Fragment>
            <Grid container spacing={2}>
                {filteredAndSearchedProducts.length > 0 &&
                sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy))
                    .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
                    .map((product: IProduct, index) => {
                        const lowQuantity = product.available_quantity < 5;
                        const outOfStock = product.available_quantity <= 0;
                        const stockLabel = outOfStock
                            ? 'Немає в наявності'
                            : lowQuantity
                                ? 'Малий залишок'
                                : 'В наявності';
                        const stockColor = outOfStock ? 'error' : lowQuantity ? 'warning' : 'success';
                        return (
                            <Grid item xs={12} sm={6} md={4}
                                  key={`${product.id}${index}${product.purchase_total_price}`}>
                                <Card sx={{height: '100%'}}>
                                    <CardContent sx={{display: 'flex', flexDirection: 'column', gap: 1.5, p: 2}}>
                                        <ProductImage
                                            imageUrl={product.images?.[0]?.url}
                                            alt={product.name}
                                            height={180}
                                        />
                                        <Box>
                                            <Typography variant="h6" component="h2" fontWeight="bold">
                                                {product.name}
                                            </Typography>
                                            {product.article && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Артикул: {product.article}
                                                </Typography>
                                            )}
                                        </Box>

                                        {product.product_description?.trim() && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 3,
                                                    overflow: 'hidden',
                                                    whiteSpace: 'pre-line'
                                                }}
                                            >
                                                {product.product_description}
                                            </Typography>
                                        )}

                                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Доступний залишок
                                                </Typography>
                                                <Typography variant="h5" component="p" fontWeight="bold"
                                                            color={outOfStock ? 'error.main' : lowQuantity ? 'warning.dark' : 'success.dark'}>
                                                    {product.available_quantity} шт.
                                                </Typography>
                                            </Box>
                                            <Chip size="small" color={stockColor} label={stockLabel}/>
                                        </Stack>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Ціна продажу
                                            </Typography>
                                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                {product.selling_price_per_item.toFixed(2)} грн / шт.
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary">
                                            Постачальник: {product.supplier?.name || 'Не вказано'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Продано: {product.selling_quantity} шт.
                                        </Typography>

                                        {isAuthenticated && (
                                            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5}}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Закупівля: {product.purchase_price_per_item.toFixed(2)} грн/шт.
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Прогноз виручки: {product.selling_total_price.toFixed(2)} грн
                                                </Typography>
                                            </Box>
                                        )}

                                        <Stack direction="row" spacing={1} sx={{mt: 'auto'}}>
                                            <Button
                                                fullWidth
                                                size="medium"
                                                variant="contained"
                                                color="warning"
                                                startIcon={<SellIcon/>}
                                                disabled={!isAuthenticated || outOfStock}
                                                onClick={() => handleOpenSale(product)}
                                            >
                                                Продати
                                            </Button>
                                            <Button
                                                fullWidth
                                                size="medium"
                                                variant="outlined"
                                                color="success"
                                                startIcon={<ShoppingCartIcon/>}
                                                disabled={!isAuthenticated}
                                                onClick={() => handlePurchase(product)}
                                            >
                                                Закупити
                                            </Button>
                                        </Stack>

                                        <Stack direction="row" alignItems="center" justifyContent="space-around"
                                               sx={{borderTop: 1, borderColor: 'divider', pt: 1}}>
                                            <Tooltip title="Редагувати">
                                                <span>
                                                    <IconButton aria-label={`Редагувати ${product.name}`} color="primary"
                                                                disabled={!isAuthenticated}
                                                                onClick={() => handleOpenEdit(product)}>
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Видалити">
                                                <span>
                                                    <IconButton aria-label={`Видалити ${product.name}`} color="error"
                                                                disabled={!isAuthenticated}
                                                                onClick={() => handleDelete(product.id)}>
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Історія">
                                                <IconButton aria-label={`Історія ${product.name}`} color="info"
                                                            onClick={() => handleOpenHistoryModal(product.id)}>
                                                    <HistoryIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Інвентаризація">
                                                <span>
                                                    <IconButton aria-label={`Інвентаризація ${product.name}`} color="primary"
                                                                disabled={!isAuthenticated}
                                                                onClick={() => handleOpenInventory(product)}>
                                                        <InventoryIcon fontSize="small"/>
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                {filteredAndSearchedProducts.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{py: 5, textAlign: 'center'}}>
                            <Typography color="text.secondary">
                                Товарів не знайдено. Зміни пошуковий запит або фільтри.
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </React.Fragment>
    );
};

export default ProductCardView;
