import React, {useState, useEffect} from 'react';
import {
    DialogContent,
    TextField,
    Button,
    DialogActions,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {ICategory, IEditProduct, ISupplier} from "../../App";
import CustomDialog from "../CustomDialog/CustomDialog";
import TextInput from "../FormComponents/TextInput";
import SupplierSelect from "../FormComponents/SupplierSelect";
import ProductNameField from "../FormComponents/ProductNameField";
import PriceField from "../FormComponents/PriceField";
import TotalPriceField from "../FormComponents/TotalPriceField";
import QuantityField from "../FormComponents/QuantityField";
import SupplierSelectField from "../FormComponents/SupplierSelectField";
import CategoriesSelect from "../FormComponents/CategoriesSelect";
import {roundToDecimalPlaces} from "../../utils/function";

interface IEditProductModalProps {
    openEdit: boolean;
    handleCloseEdit: () => void;
    editProduct: IEditProduct;
    setEditProduct: (product: IEditProduct) => void;
    handleEditSave: () => void;
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
    suppliers: ISupplier[];  // Додано

}

const EditProductModal: React.FC<IEditProductModalProps> = ({
                                                                suppliers,
                                                                openEdit,
                                                                handleCloseEdit,
                                                                editProduct,
                                                                setEditProduct,
                                                                handleEditSave,
                                                                categories,
                                                                selectedCategories,
                                                                handleCategoryChange,
                                                            }) => {
    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        quantity: '',
        price_per_item: ''
    });

    // Обчислення загальної ціни
    useEffect(() => {
        const totalPrice = editProduct.quantity * editProduct.price_per_item;
        setEditProduct({...editProduct, total_price: roundToDecimalPlaces(totalPrice,2)});
    }, [editProduct.quantity, editProduct.price_per_item]);

    // Валідація полів
    const validateFields = () => {
        // Логіка валідації
        // ...
        return true; // або false
    };

    const handleSave = () => {
        if (validateFields()) {
            handleEditSave();
        }
    };

    return (
        <CustomDialog
            open={openEdit}
            handleClose={handleCloseEdit}
            title="Редагування товару"
            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <ProductNameField
                            value={editProduct.name}
                            onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                            error={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SupplierSelectField
                            suppliers={suppliers}
                            value={editProduct.supplier_id}
                            onChange={(e) => setEditProduct({...editProduct, supplier_id: Number(e.target.value)})}
                            error={errors.supplier}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuantityField
                            value={editProduct.quantity}
                            onChange={(e) => {
                                // Видаляємо ведучий 0, якщо такий є
                                let value = e.target.value;

                                value = value.replace(/[^0-9]/g, '');


                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                }
                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    setEditProduct({...editProduct, quantity: Number(value)});
                                }
                            }}

                            error={errors.quantity}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PriceField
                            value={editProduct.price_per_item}
                            onChange={(e) => {
                                let value = e.target.value;


                                // Заміна коми на крапку для введення десяткових чисел

                                // Регулярний вираз для числа з двома знаками після крапки
                                const regex = /^\d*\.?\d{0,2}$/;

                                // Якщо введення відповідає регулярному виразу, оновлюємо state
                                if (regex.test(value) || value.endsWith('.')) {

                                    setEditProduct({
                                        ...editProduct,
                                        price_per_item: value === '' ? 0 : parseFloat(value)  // Оновлюємо
                                        // значення або
                                        // ставимо 0
                                    });
                                }

                            }}
                            error={errors.price_per_item}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TotalPriceField value={editProduct.total_price}/>
                    </Grid>
                </Grid>

                <CategoriesSelect
                    categories={categories}
                    selectedCategories={selectedCategories}
                    handleCategoryChange={handleCategoryChange}
                />
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={handleCloseEdit}>
                    Закрити
                </Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Зберігти Зміни
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

// TODO перевірка на зміни

export default EditProductModal;
