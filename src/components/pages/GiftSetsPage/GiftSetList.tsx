import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Card, CardContent, Typography, Button, Grid, CardActions, Collapse} from '@mui/material';
import {Edit, Delete, ShoppingCart, ExpandMore} from '@mui/icons-material';
import {axiosInstance} from "../../../api/api";
import EditGiftBoxDialog from "./EditGiftBoxDialog";
import GiftSetSaleModal from "./GiftSetSaleModal";
import {IGiftSet, IPackagingForGiftSet, IProductForGiftSet} from "../../../utils/types";
import {fetchGiftSets, removeGiftSet, sellGiftSet, updateGiftSet} from "../../../api/_giftBox";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import {useGiftSet} from "../../Provider/GiftSetContext";


const GiftSetList: React.FC = () => {
    const [openDialogEdit, setOpenDialogEdit] = useState(false);
    const [sellDialogOpen, setSellDialogOpen] = useState(false);

    const [dialogType, setDialogType] = useState<'edit' | 'sell'>('edit');
    const [selectedGiftSet, setSelectedGiftSet] = useState<IGiftSet | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [products, setProducts] = useState<IProductForGiftSet[]>([]); // Assuming you have a list of products
    const [packagingMaterials, setPackagingMaterials] = useState<IPackagingForGiftSet[]>([]); // Assuming you have packaging materials
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {showSnackbarMessage} = useSnackbarMessage();
    const {giftSets, fetchGiftSetsData, deleteGiftSet, updateExistingGiftSet, sellGiftSetData} = useGiftSet();


    const [expandedProduct, setExpandedProduct] = useState(null);
    const [expandedPackaging, setExpandedPackaging] = useState(null);

    const handleToggleProduct = (id) => {
        setExpandedProduct(expandedProduct === id ? null : id);
    };

    const handleTogglePackaging = (id) => {
        setExpandedPackaging(expandedPackaging === id ? null : id);
    };

    // Використання у useEffect
    useEffect(() => {
        fetchGiftSetsData();
    }, []);

// Open dialog for editing or selling
    const handleDialogOpen = (type: 'edit' | 'sell', giftSet: IGiftSet) => {
        setSellDialogOpen(false);
        setOpenDialogEdit(false);

        setSelectedGiftSet(giftSet);
        if (type === "edit") {
            setOpenDialogEdit(true);
        } else {
            setSellDialogOpen(true);
        }
    };

    const handleDialogClose = () => {
        setOpenDialogEdit(false);
        setSellDialogOpen(false);
        setSelectedGiftSet(null);
        setInputValue('');
    };

// Handle deleting the gift set
    const handleDelete = (giftSetId: number) => {
        // Підтвердження і видалення набору
        if (window.confirm("Are you sure you want to delete this gift set?")) {
            deleteGiftSet(giftSetId)
        }
    };

// Handle saving the edited gift set
    const handleSaveEdit = (updatedGiftBox: IGiftSet) => {


        updateExistingGiftSet(updatedGiftBox)


    };

// Handle selling the gift set
    const handleGiftSell = async (
        giftSet: IGiftSet,
        customer: number | null,
        saleDate: string | null,
        sellingPrice: number,
    ) => {
        if (!customer) {
            showSnackbarMessage('Будь ласка, виберіть покупця для завершення продажу.', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        const requestData = {
            gift_set_id: giftSet.id,
            customer_id: customer,
            sale_date: saleDate,
            selling_price: sellingPrice
        };

        try {
            await sellGiftSetData(requestData);
            handleDialogClose();
        } catch (err: any) {
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Grid container spacing={2}>
                {giftSets.length > 0 ? (giftSets.map((giftSet) => (
                        <Grid item xs={12} sm={6} md={4} key={giftSet.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        <strong>Назва:</strong> {giftSet.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Опис:</strong> {giftSet.description}
                                    </Typography>

                                    <Typography variant="body1" style={{marginTop: '10px'}}>
                                        <strong>Зміст:</strong>
                                    </Typography>

                                    <Button fullWidth size="small" onClick={() => handleToggleProduct(giftSet.id)}>
                                        <ExpandMore/> Продукти
                                    </Button>

                                    <Collapse in={expandedProduct === giftSet.id}>
                                        <ul>
                                            {giftSet.products.map((product) => (
                                                <li key={product.product_id}>{product.name} (x{product.quantity}) -
                                                    {product.price}</li>
                                            ))}
                                        </ul>
                                    </Collapse>

                                    <Button fullWidth size="small" onClick={() => handleTogglePackaging(giftSet.id)}>
                                        <ExpandMore/> Пакування
                                    </Button>
                                    <Collapse in={expandedPackaging === giftSet.id}>
                                        <ul>
                                            {giftSet.packagings.map((packaging) => (
                                                <li key={packaging.packaging_id}>{packaging.name} (x{packaging.quantity})
                                                    - {packaging.price}</li>
                                            ))}
                                        </ul>
                                    </Collapse>


                                    <Typography variant="h6" style={{marginTop: '10px'}}>
                                        <strong>Ціна:</strong> {giftSet.gift_selling_price}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Собівартість:</strong> {giftSet.total_price}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button fullWidth size="small" color="primary"
                                            onClick={() => handleDialogOpen('edit', giftSet)}>
                                        <Edit/> Редагувати
                                    </Button>
                                    <Button fullWidth size="small" color="success"
                                            onClick={() => handleDialogOpen("sell", giftSet)}>
                                        <ShoppingCart/> Продати
                                    </Button>
                                    <Button fullWidth size="small" color="secondary"
                                            onClick={() => handleDelete(giftSet.id)}>
                                        <Delete/> Видалити
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    )))
                    :
                    <Grid item xs={12}>
                        <Typography>
                            Подарункові набори відсутні
                        </Typography>
                    </Grid>
                }
            </Grid>

            {selectedGiftSet && (
                <EditGiftBoxDialog
                    open={openDialogEdit}
                    onClose={handleDialogClose}
                    giftBox={selectedGiftSet}
                    onSave={handleSaveEdit}
                />
            )}
            {selectedGiftSet && (
                <GiftSetSaleModal
                    error={error}
                    handleGiftSell={handleGiftSell}
                    loading={loading}
                    open={sellDialogOpen}
                    giftSet={selectedGiftSet}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
};

export default GiftSetList;
