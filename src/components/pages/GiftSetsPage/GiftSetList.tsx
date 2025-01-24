import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Card, CardContent, Typography, Button, Grid, CardActions} from '@mui/material';
import {Edit, Delete, ShoppingCart} from '@mui/icons-material';
import {axiosInstance} from "../../../api/api";
import EditGiftBoxDialog from "./EditGiftBoxDialog";

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

    const [dialogType, setDialogType] = useState<'edit' | 'purchase'>('edit');
    const [selectedGiftSet, setSelectedGiftSet] = useState<GiftSet | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [products, setProducts] = useState<Product[]>([]); // Assuming you have a list of products
    const [packagingMaterials, setPackagingMaterials] = useState<Packaging[]>([]); // Assuming you have packaging materials

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

    const handleDialogOpen = (type: 'edit' | 'purchase', giftSet: GiftSet) => {
        setDialogType(type);
        setSelectedGiftSet(giftSet);
        setOpenDialogEdit(true);
    };

    const handleDialogClose = () => {
        setOpenDialogEdit(false);
        setSelectedGiftSet(null);
        setInputValue('');
    };

    const handleEdit = (giftSetId: number) => {
        // Перехід на сторінку редагування або відкриття форми
        console.log("Edit Gift Set", giftSetId);
        // Можна додати логіку для редагування набору
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

    const handlePurchase = (giftSetId: number) => {
        // Логіка покупки
        // Відкриття форми покупки або перенаправлення на сторінку оформлення покупки
        console.log("Purchase Gift Set", giftSetId);
        // Можна додати логіку для оформлення покупки
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
                                <Typography variant="h5">{giftSet.name}</Typography>
                                <Typography variant="body2" color="textSecondary">{giftSet.description}</Typography>

                                <Typography variant="body1" style={{marginTop: '10px'}}>
                                    <strong>Content:</strong>
                                </Typography>
                                <Typography component={'div'} variant="body2">
                                    <strong>Products:</strong>
                                    <ul>
                                        {giftSet.products.map((product) => (
                                            <li key={product.product_id}>{product.name} (x{product.quantity}) -
                                                ${product.price}</li>
                                        ))}
                                    </ul>

                                    <strong>Packaging:</strong>
                                    <ul>
                                        {giftSet.packagings.map((packaging) => (
                                            <li key={packaging.packaging_id}>{packaging.name} (x{packaging.quantity}) -
                                                ${packaging.price}</li>
                                        ))}
                                    </ul>
                                </Typography>

                                <Typography variant="h6" style={{marginTop: '10px'}}>
                                    <strong>Price:</strong> ${giftSet.gift_selling_price}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Cost Price:</strong> ${giftSet.total_price}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => handleDialogOpen('edit', giftSet)}>
                                    <Edit /> Edit
                                </Button>
                                <Button size="small" color="success" onClick={() => handlePurchase(giftSet.id)}>
                                    <ShoppingCart /> Buy
                                </Button>
                                <Button size="small" color="secondary" onClick={() => handleDelete(giftSet.id)}>
                                    <Delete /> Delete
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
        </div>
    );
};

export default GiftSetList;
