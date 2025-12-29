import React from 'react';
import {Dialog, DialogTitle, DialogContent, Typography, Grid, IconButton, DialogActions} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CustomDialog from "../CustomDialog/CustomDialog";
import {IEditProduct, IProduct} from "../../../utils/types";
import CancelButton from "../../Buttons/CancelButton";
import {useCategories} from "../../Provider/CategoryContext";

interface ProductInfoModalProps {
    open: boolean;
    onClose: () => void;
    product: IProduct;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({open, onClose, product}) => {
    const {categories} = useCategories();
    const matchedCategories = categories.filter(category =>
        product.category_ids.includes(category.id)
    );

    console.log("product",product);
    return (
        <CustomDialog maxWidth="sm" title={' Детальна інформація про товар'} handleClose={onClose} open={open}>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Назва */}
                    <Grid item xs={12}>
                        <Typography variant="overline" color="text.secondary">
                            Назва
                        </Typography>
                        <Typography variant="h6">
                            {product.name}
                        </Typography>
                    </Grid>

                    {/* Артикул */}
                    <Grid item xs={12}>
                        <Typography variant="overline" color="text.secondary">
                            Артикул
                        </Typography>
                        <Typography>
                            {product.article}
                        </Typography>
                    </Grid>

                    {/* Кількість */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Кількість
                        </Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                            Загальна
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.total_quantity}
                        </Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                            На складі
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.available_quantity}
                        </Typography>
                    </Grid>

                    <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                            Продано, од.
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.sold_quantity}
                        </Typography>
                    </Grid>

                    {/* Ціни */}
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Ціна закупки (за од.)
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.purchase_price_per_item} грн
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Загальна ціна закупки
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.purchase_total_price} грн
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Ціна продажу (за од.)
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.selling_price_per_item} грн
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Очікуваний дохід (за од.)
                        </Typography>
                        <Typography fontWeight={500}>
                            {product.selling_price_per_item - product.purchase_price_per_item} грн
                        </Typography>
                    </Grid>

                    {/* Дата */}
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Дата створення
                        </Typography>
                        <Typography>
                            {new Date(product.created_date).toLocaleDateString()}
                        </Typography>
                    </Grid>

                    {/* Постачальник */}
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                            Постачальник
                        </Typography>
                        <Typography
                            color={product.supplier?.is_active === false ? 'text.disabled' : 'text.primary'}
                        >
                            {!product.supplier?.is_active && 'не активний '}
                            {product.supplier?.name || '—'}
                        </Typography>
                    </Grid>

                    {/* Категорії */}
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                            Категорії
                        </Typography>
                        <Typography>
                            {matchedCategories.map(c => c.name).join(', ') || '—'}
                        </Typography>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={onClose}>
                    Закрити
                </CancelButton>
            </DialogActions>
        </CustomDialog>
    );
};

export default ProductInfoModal;
