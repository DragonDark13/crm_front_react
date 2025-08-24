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
                    <Grid item xs={12}>
                        <Typography variant="h6">Назва: {product.name}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography >Артікул: {product.article}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={"h6"}>Кількість: </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography>Загальна: {product.total_quantity}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography>На складі: {product.available_quantity}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography>Продано од.: {product.sold_quantity}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Дата створення: {new Date(product.created_date).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Ціна закупки за одиницю: {product.purchase_price_per_item} грн</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Загальна ціна закупки: {product.purchase_total_price} грн</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Ціна продажу за одиницю: {product.selling_price_per_item} грн</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Очікуваний дохід за
                            од: {product.selling_total_price - product.purchase_price_per_item} грн</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            Постачальник:
                            <Typography color={product.supplier?.is_active===false ? 'textDisabled':'inherit'} component={"span"}> {!product.supplier?.is_active ? 'не активний ': null} {product.supplier?.name || '—'}  </Typography>
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            Категорії: {matchedCategories
                            .map(c => c.name)
                            .join(', ') || '—'}
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
