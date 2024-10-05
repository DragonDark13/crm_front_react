import React, {useState, useEffect} from 'react';
import {
    DialogContent,
    Button,
    DialogActions, Grid, TextField,
} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";

import ProductNameField from "../FormComponents/ProductNameField";
import PriceField from "../FormComponents/PriceField";
import TotalPriceField from "../FormComponents/TotalPriceField";
import QuantityField from "../FormComponents/QuantityField";
import CategoriesSelect from "../FormComponents/CategoriesSelect";
import {formatDate, formatDateToBack, roundToDecimalPlaces} from "../../utils/function";
import SupplierSelect from "../FormComponents/SupplierSelect";
import {ICategory, IEditProduct, ISupplier} from "../../utils/types";

interface IEditProductModalProps {
    openEdit: boolean;
    handleCloseEdit: () => void;
    editProduct: IEditProduct;
    setEditProduct: React.Dispatch<React.SetStateAction<IEditProduct | null>>;
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
        price_per_item: '',
        created_date: ""
    });


    console.log("editProduct", editProduct);

    // Обчислення загальної ціни
    useEffect(() => {
        const totalPrice = editProduct.quantity * editProduct.price_per_item;
        // setEditProduct({...editProduct, total_price: roundToDecimalPlaces(totalPrice, 2)});
        handleFieldChange('total_price', roundToDecimalPlaces(totalPrice, 2))
    }, [editProduct.quantity, editProduct.price_per_item]);

    // Валідація полів
    const validateFields = () => {
        let tempErrors = {name: '', supplier: '', quantity: '', price_per_item: '', created_date: ""};
        let isValid = true;

        if (!editProduct.name.trim()) {
            tempErrors.name = 'Name is required';
            isValid = false;
        } else if (editProduct.name.trim().length < 10) {
            tempErrors.name = 'Name must be at least 10 characters long'
            isValid = false;
        } else if (editProduct.name.length > 100) {
            tempErrors.name = 'Name cannot exceed 100 characters';
            isValid = false;
        }

        // if (!editProduct.supplier) {
        //     tempErrors.supplier = 'Supplier is required';
        //     isValid = false;
        // }

        if (editProduct.quantity < 0) {
            tempErrors.quantity = 'Quantity cannot be less than 0';
            isValid = false;
        } else if (editProduct.quantity > 100000) {
            tempErrors.quantity = 'Quantity cannot exceed 100,000';
            isValid = false;
        }

        if (editProduct.price_per_item < 0) {
            tempErrors.price_per_item = 'Price per item cannot be less than 0';
            isValid = false;
        } else if (editProduct.price_per_item > 100000) {
            tempErrors.price_per_item = 'Price per item cannot exceed 100,000';
            isValid = false;
        }

        if (!editProduct.created_date.trim()) {
            tempErrors.name = 'created_date is required';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const [isModified, setIsModified] = useState(false);
    const [originalProduct, setOriginalProduct] = useState<IEditProduct>(editProduct);

    useEffect(() => {

        setOriginalProduct(editProduct);
        setIsModified(false); // Reset modified state when opening modal

    }, []);

    handleCategoryChange = (categoryId: number) => {
        setEditProduct((prevProduct) => {
            // Якщо prevProduct = null, повертаємо початковий стан
            if (!prevProduct) return prevProduct;

            const updatedCategories = prevProduct.category_ids.includes(categoryId)
                ? prevProduct.category_ids.filter(id => id !== categoryId) // Відміна вибору
                : [...prevProduct.category_ids, categoryId]; // Додавання вибраної категорії

            // Перевіряємо, чи були зміни в категоріях
            setIsModified(JSON.stringify(originalProduct.category_ids) !== JSON.stringify(updatedCategories));

            // Повертаємо оновлений продукт
            return {
                ...prevProduct,
                category_ids: updatedCategories // Оновлення категорій
            };
        });
    };

    const handleFieldChange = (field: keyof IEditProduct, value: any) => {
        setEditProduct((prevEd) => {
            // Якщо prevEd = null, повертаємо початковий стан
            if (!prevEd) return prevEd;

            const updatedProduct: IEditProduct = {
                ...prevEd, // Spread попереднього стану
                [field]: value, // Оновлюємо конкретне поле
            };

            // Перевіряємо, чи був продукт змінений
            setIsModified(JSON.stringify(originalProduct) !== JSON.stringify(updatedProduct));

            // Повертаємо оновлений продукт
            return updatedProduct;
        });
    };


    const handleSave = () => {
        if (validateFields()) {
            handleEditSave();
        }
    };
    const incrementQuantity = () => {
        if (editProduct.quantity < 1000) {
            handleFieldChange("quantity", Number(editProduct.quantity + 1))
        }
    };

    const decrementQuantity = () => {
        if (editProduct.quantity > 1) {
            handleFieldChange("quantity", Number(editProduct.quantity - 1))

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
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            error={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SupplierSelect
                            suppliers={suppliers}
                            value={editProduct.supplier_id}
                            onChange={(e) => handleFieldChange('supplier_id', Number(e.target.value))}
                            error={errors.supplier}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuantityField
                            onIncrement={incrementQuantity}
                            onDecrement={decrementQuantity}
                            value={editProduct.quantity}
                            onChange={(e) => {
                                // Видаляємо ведучий 0, якщо такий є
                                let value = e.target.value;

                                value = value.replace(/[^0-9]/g, '');


                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                }
                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    handleFieldChange('quantity', Number(value));
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
                                    handleFieldChange('price_per_item', value === '' ? 0 : parseFloat(value));


                                }

                            }}
                            error={errors.price_per_item}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TotalPriceField value={editProduct.total_price}/>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            required
                            label="Дата створення"
                            type="date"
                            value={editProduct.created_date ? formatDate(editProduct.created_date) : ''}
                            onChange={(e) => handleFieldChange("created_date", formatDateToBack(e.target.value))}
                            fullWidth
                            margin="normal"
                        />

                    </Grid>

                </Grid>

                <CategoriesSelect
                    categories={categories}
                    selectedCategories={editProduct.category_ids}
                    handleCategoryChange={handleCategoryChange}
                />
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={handleCloseEdit}>
                    Закрити
                </Button>
                <Button disabled={!isModified} variant="contained" color="primary" onClick={handleSave}>
                    Зберігти Зміни
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

// TODO перевірка на зміни

export default EditProductModal;
