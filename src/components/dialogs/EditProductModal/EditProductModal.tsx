import React, {useState, useEffect} from 'react';
import {
    DialogContent,
    Button,
    DialogActions, Grid, TextField, Typography,
} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";

import ProductNameField from "../../FormComponents/ProductNameField";
import PriceField from "../../FormComponents/PriceField";
import TotalPriceField from "../../FormComponents/TotalPriceField";
import QuantityField from "../../FormComponents/QuantityField";
import CategoriesSelect from "../../FormComponents/CategoriesSelect";
import {formatDate, formatDateToBack, roundToDecimalPlaces} from "../../../utils/function";
import SupplierSelect from "../../FormComponents/SupplierSelect";
import { IEditProduct,} from "../../../utils/types";
import {useCategories} from "../../Provider/CategoryContext";
import {useSuppliers} from "../../Provider/SupplierContext";

interface IEditProductModalProps {
    openEdit: boolean;
    handleCloseEdit: () => void;
    editProduct: IEditProduct;
    setEditProduct: React.Dispatch<React.SetStateAction<IEditProduct | null>>;
    handleEditSave: () => void;
}

const EditProductModal: React.FC<IEditProductModalProps> = ({
                                                                openEdit,
                                                                handleCloseEdit,
                                                                editProduct,
                                                                setEditProduct,
                                                                handleEditSave,
                                                                selectedCategories,
                                                            }) => {


    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        available_quantity: '',
        price_per_item: '',
        created_date: ""
    });
    const {categories} = useCategories();
    const {suppliers} = useSuppliers()

    const [diffWithPrice, setDiffWithPrice] = useState(0)
    console.log("editProduct", editProduct);

    // Обчислення загальної ціни
    useEffect(() => {
        if (editProduct.available_quantity > 0 && editProduct.purchase_price_per_item > 0) {
            const totalPrice = editProduct.available_quantity * editProduct.purchase_price_per_item;
            const roundedPrice = roundToDecimalPlaces(totalPrice, 2);

            // Only update if the value has changed
            if (editProduct.purchase_total_price !== roundedPrice) {
                handleFieldChange('purchase_total_price', roundedPrice);
            }
        }
    }, [editProduct.available_quantity, editProduct.purchase_price_per_item]);


    // Валідація полів
    const validateFields = () => {
        let tempErrors = {name: '', supplier: '', available_quantity: '', price_per_item: '', created_date: ""};
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

        if (editProduct.available_quantity < 0) {
            tempErrors.available_quantity = 'Quantity cannot be less than 0';
            isValid = false;
        } else if (editProduct.available_quantity > 100000) {
            tempErrors.available_quantity = 'Quantity cannot exceed 100,000';
            isValid = false;
        }

        if (editProduct.purchase_price_per_item < 0) {
            tempErrors.price_per_item = 'Price per item cannot be less than 0';
            isValid = false;
        } else if (editProduct.purchase_price_per_item > 100000) {
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

    const compareCategories = (originalCategories: number[], updatedCategories: number[]) => {
        const differences: number[] = [];

        // Якщо довжина масивів відрізняється, то однозначно є зміни
        if (originalCategories.length !== updatedCategories.length) {
            return true; // Значить, є зміни
        }

        // Порівнюємо кожен елемент масиву
        for (let i = 0; i < originalCategories.length; i++) {
            if (!updatedCategories.includes(originalCategories[i])) {
                differences.push(originalCategories[i]); // Додаємо до списку відмінностей
            }
        }

        // Виводимо список відмінностей
        if (differences.length > 0) {
            console.log('Категорії, які відрізняються:', differences);
            return true; // Якщо є відмінності
        }

        return false; // Якщо всі категорії однакові
    };


    const handleCategoryChange = (categoryId: number[]) => {
        setEditProduct((prevProduct) => {
            // Якщо prevProduct = null, повертаємо початковий стан
            if (!prevProduct) return prevProduct;

            // const updatedCategories = prevProduct.category_ids.includes(categoryId)
            //     ? prevProduct.category_ids.filter(id => id !== categoryId) // Відміна вибору
            //     : [...prevProduct.category_ids, categoryId]; // Додавання вибраної категорії

            // Перевіряємо, чи були зміни в категоріях
            const isModified = compareCategories(originalProduct.category_ids, categoryId);
            setIsModified(isModified);

            // Повертаємо оновлений продукт
            return {
                ...prevProduct,
                category_ids: categoryId // Оновлення категорій
            };
        });
    };

    const compareObjects = (originalProduct: Record<string, any>, updatedProduct: Record<string, any>) => {
        const differences: Record<string, any> = {};

        // Об'єднуємо ключі обох об'єктів (щоб не пропустити жодної властивості)
        const allKeys = new Set([...Object.keys(originalProduct), ...Object.keys(updatedProduct)]);

        // Порівнюємо кожну властивість
        allKeys.forEach(key => {
            if (originalProduct[key] !== updatedProduct[key]) {
                differences[key] = {
                    original: originalProduct[key],
                    updated: updatedProduct[key]
                };
            }
        });

        if (Object.keys(differences).length > 0) {
            console.log('Знайдені відмінності:', differences);
            return true; // Відмінності знайдені
        }

        return false; // Об'єкти однакові
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

            const isModified = compareObjects(originalProduct, updatedProduct);
            setIsModified(isModified);

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
        if (editProduct.available_quantity < 1000) {
            handleFieldChange("available_quantity", Number(editProduct.available_quantity + 1))
        }
    };

    const decrementQuantity = () => {
        if (editProduct.available_quantity > 1) {
            handleFieldChange("available_quantity", Number(editProduct.available_quantity - 1))

        }
    };

    useEffect(() => {
        if (editProduct.purchase_price_per_item && editProduct.selling_price_per_item) {
            setDiffWithPrice(editProduct.selling_price_per_item - editProduct.purchase_price_per_item);
        }
    }, [editProduct.selling_price_per_item, editProduct.purchase_price_per_item])


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
                    <Grid item xs={12} sm={6} md={3}>
                        <QuantityField
                            onIncrement={incrementQuantity}
                            onDecrement={decrementQuantity}
                            value={editProduct.available_quantity}
                            onChange={(e) => {
                                // Видаляємо ведучий 0, якщо такий є
                                let value = e.target.value;

                                value = value.replace(/[^0-9]/g, '');


                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                }
                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    handleFieldChange('available_quantity', Number(value));
                                }
                            }}

                            error={errors.available_quantity}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <PriceField
                            value={editProduct.purchase_price_per_item}
                            onChange={(e) => {
                                let value = e.target.value;

                                // Заміна коми на крапку для введення десяткових чисел

                                // Регулярний вираз для числа з двома знаками після крапки
                                const regex = /^\d*\.?\d{0,2}$/;

                                // Якщо введення відповідає регулярному виразу, оновлюємо state
                                if (regex.test(value) || value.endsWith('.')) {
                                    handleFieldChange('purchase_price_per_item', value === '' ? 0 : parseFloat(value));


                                }

                            }}
                            error={errors.price_per_item}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TotalPriceField value={editProduct.purchase_total_price}/>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <PriceField
                            label="ціна за 1шт (продаж)"
                            value={editProduct.selling_price_per_item}
                            onChange={(e) => {
                                let value = e.target.value;


                                // Заміна коми на крапку для введення десяткових чисел

                                // Регулярний вираз для числа з двома знаками після крапки
                                const regex = /^\d*\.?\d{0,2}$/;

                                // Якщо введення відповідає регулярному виразу, оновлюємо state
                                if (regex.test(value) || value.endsWith('.')) {

                                    handleFieldChange('selling_price_per_item', value === '' ? 0 : parseFloat(value));
                                }

                            }}

                            error={errors.price_per_item}
                        />

                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography>
                            Різниця в цінах за 1шт: {diffWithPrice.toFixed(2)} грн.
                        </Typography>
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
