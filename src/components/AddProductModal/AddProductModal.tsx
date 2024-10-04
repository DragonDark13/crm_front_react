import {
    Button,
    DialogContent,
    DialogActions, Grid,
} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import {useEffect, useState} from "react";
import ProductNameField from "../FormComponents/ProductNameField";
import PriceField from "../FormComponents/PriceField";
import TotalPriceField from "../FormComponents/TotalPriceField";
import QuantityField from "../FormComponents/QuantityField";
import CategoriesSelect from "../FormComponents/CategoriesSelect";
import {roundToDecimalPlaces} from "../../utils/function";
import SupplierSelect from "../FormComponents/SupplierSelect";
import {ICategory, INewProduct} from "../../utils/types";
import {addProduct} from "../../api/api";
//TODO додай постачальників таблиці
// Повідомлення про успіх

interface IAddProductModal {
    openAdd: boolean,
    handleCloseAdd: () => void,
    newProduct: INewProduct,
    setNewProduct: (product: INewProduct) => void,
    categories: ICategory[],
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number) => void,
    handleAdd: () => void
    suppliers: { id: number; name: string }[];  // Додано

}

const AddProductModal = ({
                             openAdd,
                             handleCloseAdd,
                             newProduct,
                             setNewProduct,
                             categories,
                             selectedCategories,
                             handleCategoryChange,
                             handleAdd,
                             suppliers
                         }: IAddProductModal) => {
    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        quantity: '',
        price_per_item: ''
    });

    const validateFields = () => {
        const newErrors = {
            name: newProduct.name.trim().length < 10 ? 'Name must be at least 10 characters long' : '',
            supplier: newProduct.supplier_id === '' ? 'Supplier is required' : '',
            quantity: newProduct.quantity < 0 ? 'Quantity must be greater than or equal to 0' : '',
            price_per_item: newProduct.price_per_item < 0 ? 'Price per item must be greater than or equal to 0' : ''
        };
        setErrors(newErrors);

        // Return true if there are no errors
        return Object.values(newErrors).every(error => error === '');
    };

    const handleAddClick = () => {
        if (validateFields()) {
            handleAdd();
        }
    };

    const incrementQuantity = () => {
        if (newProduct.quantity < 1000) {
            setNewProduct({
                ...newProduct,
                quantity: newProduct.quantity + 1
            });
        }
    };

    const decrementQuantity = () => {
        if (newProduct.quantity > 1) {
            setNewProduct({
                ...newProduct,
                quantity: newProduct.quantity = 1
            });
        }
    };


    // Автоматичне оновлення total_price як добутку quantity і price_per_item
    useEffect(() => {
        const totalPrice = newProduct.quantity * newProduct.price_per_item;
        setNewProduct({...newProduct, total_price: roundToDecimalPlaces(totalPrice, 2)});
    }, [newProduct.quantity, newProduct.price_per_item]);

    const isAddButtonDisabled = newProduct.name.trim().length < 10 ||
       !newProduct.supplier_id || newProduct.quantity <= 0;


    return (
        <CustomDialog
            open={openAdd}
            handleClose={handleCloseAdd}
            title="Додайте новий товар"
            maxWidth="md"
        >
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <ProductNameField
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            error={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <SupplierSelect
                            suppliers={suppliers}
                            value={newProduct.supplier_id}
                            onChange={(e) => setNewProduct({...newProduct, supplier_id: Number(e.target.value)})}
                            error={errors.supplier}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <QuantityField
                            onIncrement={incrementQuantity}
                            onDecrement={decrementQuantity}
                            value={newProduct.quantity}
                            onChange={(e) => {
                                // Видаляємо ведучий 0, якщо такий є
                                let value = e.target.value;

                                value = value.replace(/[^0-9]/g, '');


                                if (value.startsWith('0')) {
                                    value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                    setNewProduct({...newProduct, quantity: Number(value)});
                                }
                                if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                    setNewProduct({...newProduct, quantity: Number(value)});
                                }
                            }}

                            error={errors.quantity}
                        />

                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PriceField
                            value={newProduct.price_per_item}
                            onChange={(e) => {
                                let value = e.target.value;


                                // Заміна коми на крапку для введення десяткових чисел

                                // Регулярний вираз для числа з двома знаками після крапки
                                const regex = /^\d*\.?\d{0,2}$/;

                                // Якщо введення відповідає регулярному виразу, оновлюємо state
                                if (regex.test(value) || value.endsWith('.')) {

                                    setNewProduct({
                                        ...newProduct,
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
                        <TotalPriceField value={newProduct.total_price}/>
                    </Grid>
                </Grid>
                <CategoriesSelect categories={categories} selectedCategories={selectedCategories}
                                  handleCategoryChange={handleCategoryChange}/>

            </DialogContent>
            <DialogActions>
                <Button variant={"outlined"} onClick={handleCloseAdd}>Закрити</Button>
                <Button variant="contained" color="primary" onClick={handleAddClick} disabled={isAddButtonDisabled}>
                    Додати
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddProductModal;
