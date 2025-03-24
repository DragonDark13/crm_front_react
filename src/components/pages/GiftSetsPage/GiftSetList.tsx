import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Card, CardContent, Typography, Button, Grid, CardActions, Collapse} from '@mui/material';
import {Edit, Delete, ShoppingCart, ExpandMore} from '@mui/icons-material';
import {axiosInstance} from "../../../api/api";
import EditGiftBoxDialog from "./EditGiftBoxDialog";
import GiftSetSaleModal from "./GiftSetSaleModal";

interface Product {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
}

interface Packaging {
    packaging_id: number;
    name: string;
    quantity: number;
    price: number;
}

interface GiftSet {
    id: number;
    name: string;
    description: string;
    total_price: number;
    gift_selling_price: number;
    products: Product[];
    packagings: Packaging[];
}

const GiftSetList: React.FC = () => {
    const [giftSets, setGiftSets] = useState<GiftSet[]>([]);
    const [openDialogEdit, setOpenDialogEdit] = useState(false);
    const [sellDialogOpen, setSellDialogOpen] = useState(false);

    const [dialogType, setDialogType] = useState<'edit' | 'sell'>('edit');
    const [selectedGiftSet, setSelectedGiftSet] = useState<GiftSet | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [products, setProducts] = useState<Product[]>([]); // Assuming you have a list of products
    const [packagingMaterials, setPackagingMaterials] = useState<Packaging[]>([]); // Assuming you have packaging materials

    const [expandedProduct, setExpandedProduct] = useState(null);
    const [expandedPackaging, setExpandedPackaging] = useState(null);

    const handleToggleProduct = (id) => {
        setExpandedProduct(expandedProduct === id ? null : id);
    };

    const handleTogglePackaging = (id) => {
        setExpandedPackaging(expandedPackaging === id ? null : id);
    };

    useEffect(() => {
        // Отримуємо список наборів
        axiosInstance.get('/get_all_gift_sets')
            .then(response => {
                setGiftSets(response.data);
            })
            .catch(error => {
                console.error("Error fetching gift sets:", error);
            });
    }, []);


    const handleDialogOpen = (type: 'edit' | 'sell', giftSet: GiftSet) => {
        setSellDialogOpen(false)
        setOpenDialogEdit(false)

        setSelectedGiftSet(giftSet);
        if (type === "edit") {
            setOpenDialogEdit(true);
        } else {
            setSellDialogOpen(true)
        }
    };

    const handleDialogClose = () => {
        setOpenDialogEdit(false);
        setSellDialogOpen(false)
        setSelectedGiftSet(null);
        setInputValue('');
    };


    const handleDelete = (giftSetId: number) => {
        // Підтвердження і видалення набору
        if (window.confirm("Are you sure you want to delete this gift set?")) {
            axiosInstance.delete(`/remove_gift_set/${giftSetId}`)
                .then(() => {
                    setGiftSets(prevSets => prevSets.filter(giftSet => giftSet.id !== giftSetId));
                })
                .catch(error => {
                    console.error("Error deleting gift set:", error);
                });
        }
    };


    const handleSaveEdit = (updatedGiftBox: GiftSet) => {
        // Handle saving the edited gift set
        axiosInstance.put(`/update_gift_set/${updatedGiftBox.id}`, updatedGiftBox)
            .then(() => {
                handleDialogClose();  // Close the dialog after saving
            })
            .catch(error => {
                console.error("Error updating gift set:", error);
            });
    };

    return (
        <div>
            <Grid container spacing={2}>
                {giftSets.map((giftSet) => (
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

                                <Button  fullWidth size="small" onClick={() => handleToggleProduct(giftSet.id)}>
                                    <ExpandMore/> Продукти
                                </Button>

                                <Collapse in={expandedProduct === giftSet.id}>
                                    <ul>
                                        {giftSet.products.map((product) => (
                                            <li key={product.product_id}>{product.name} (x{product.quantity}) -
                                                ${product.price}</li>
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
                                                - ${packaging.price}</li>
                                        ))}
                                    </ul>
                                </Collapse>


                                <Typography variant="h6" style={{marginTop: '10px'}}>
                                    <strong>Ціна:</strong> ${giftSet.gift_selling_price}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Собівартість:</strong> ${giftSet.total_price}
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
                ))}
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
                    open={sellDialogOpen}
                    giftSet={selectedGiftSet}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
};

export default GiftSetList;
