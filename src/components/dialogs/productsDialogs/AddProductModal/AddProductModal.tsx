import {
    Button,
    DialogContent,
    DialogActions, Grid, TextField, Typography, Box,
} from '@mui/material';
import CustomDialog from "../../CustomDialog/CustomDialog";
import React, {useEffect, useState} from "react";
import ProductNameField from "../../../FormComponents/ProductNameField";
import PriceField from "../../../FormComponents/PriceField";
import TotalPriceField from "../../../FormComponents/TotalPriceField";
import QuantityField from "../../../FormComponents/QuantityField";
import CategoriesSelect from "../../../FormComponents/CategoriesSelect";
import {roundToDecimalPlaces} from "../../../../utils/function";
import SupplierSelect from "../../../FormComponents/SupplierSelect";
import {ICategory, INewProduct, INewSupplier, modalNames, ModalNames} from "../../../../utils/types";
import {useCategories} from "../../../Provider/CategoryContext";
import {useSuppliers} from "../../../Provider/SupplierContext";
import AddSupplierModal from "../../AddSupplierModal/AddSupplierModal";
import {addSupplier} from "../../../../api/_supplier";
import {useSnackbarMessage} from "../../../Provider/SnackbarMessageContext";
import AddIcon from "@mui/icons-material/Add";
//TODO додай постачальників таблиці
// TODO Повідомлення про успіх
// TODO Окремі поля для ціни закупівельної і проданої


interface IAddProductModal {
    openAdd: boolean,
    handleCloseAdd: () => void,
    newProduct: INewProduct,
    setNewProduct: (product: INewProduct) => void,
    selectedCategories: number[],
    handleCategoryChange: (categoryID: number[]) => void,
    handleAdd: () => void
}

const AddProductModal = ({
                             openAdd,
                             handleCloseAdd,
                             newProduct,
                             setNewProduct,
                             selectedCategories,
                             handleCategoryChange,
                             handleAdd,
                         }: IAddProductModal) => {
    const [errors, setErrors] = useState({
        name: '',
        supplier: '',
        available_quantity: '',
        price_per_item: ''
    });

    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: true}));
    };

    const {showSnackbarMessage} = useSnackbarMessage()


    const {categories} = useCategories();
    const {suppliers, fetchSuppliersFunc} = useSuppliers()


    const [diffWithPrice, setDiffWithPrice] = useState(0)

    const validateFields = () => {
        const newErrors = {
            name: newProduct.name.trim().length < 10 ? 'Name must be at least 10 characters long' : '',
            supplier: newProduct.supplier_id === '' ? 'Supplier is required' : '',
            available_quantity: newProduct.available_quantity < 0 ? 'Quantity must be greater than or equal to 0' : '',
            price_per_item: newProduct.purchase_price_per_item < 0 ? 'Price per item must be greater than or equal to 0' : ''
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
        if (newProduct.available_quantity < 1000) {
            setNewProduct({
                ...newProduct,
                available_quantity: newProduct.available_quantity + 1
            });
        }
    };

    const decrementQuantity = () => {
        if (newProduct.available_quantity > 0) {
            setNewProduct({
                ...newProduct,
                available_quantity: newProduct.available_quantity = 0
            });
        }
    };


    // Автоматичне оновлення total_price як добутку available_quantity і price_per_item
    useEffect(() => {
        const totalPrice = newProduct.available_quantity * newProduct.purchase_price_per_item;
        setNewProduct({...newProduct, purchase_total_price: roundToDecimalPlaces(totalPrice, 2)});
    }, [newProduct.available_quantity, newProduct.purchase_price_per_item]);

    const isAddButtonDisabled = newProduct.name.trim().length < 10 ||
        !newProduct.supplier_id || newProduct.available_quantity < 0;

    useEffect(() => {
        if (newProduct.purchase_price_per_item && newProduct.selling_price_per_item) {
            setDiffWithPrice(newProduct.selling_price_per_item - newProduct.purchase_price_per_item);
        }
    }, [newProduct.selling_price_per_item, newProduct.purchase_price_per_item])

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
    };

    const handleAddSupplier = (newSupplier: INewSupplier) => {

        addSupplier(newSupplier)
            .then((response) => {
                handleModalClose("openAddSupplierOpen");
                fetchSuppliersFunc(); // Оновити список постачальників після додавання
                debugger
                console.log(response);

                setNewProduct({
                    ...newProduct,
                    supplier_id: response.supplier_id
                })


                showSnackbarMessage('Supplier completed successfully!', 'success'); // Show success message

            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbarMessage('There was an error saving the supplier!', "error");
            });
    };


    return (
        <React.Fragment>
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
                            <Grid container alignItems={"center"}>
                                <Grid item xs={12} md={8}>
                                    <SupplierSelect
                                        suppliers={suppliers}
                                        value={newProduct.supplier_id}
                                        onChange={(e) => setNewProduct({
                                            ...newProduct,
                                            supplier_id: Number(e.target.value)
                                        })}
                                        error={errors.supplier}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button
                                        color="secondary"
                                        size={"large"} variant={"contained"} endIcon={<AddIcon/>}
                                        onClick={() => handleModalOpen("openAddSupplierOpen")}
                                    >
                                        Додати
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <QuantityField
                                onIncrement={incrementQuantity}
                                onDecrement={decrementQuantity}
                                value={newProduct.available_quantity}
                                onChange={(e) => {
                                    // Видаляємо ведучий 0, якщо такий є
                                    let value = e.target.value;

                                    value = value.replace(/[^0-9]/g, '');


                                    if (value.startsWith('0')) {
                                        value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                        setNewProduct({...newProduct, available_quantity: Number(value)});
                                    }
                                    if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                        setNewProduct({...newProduct, available_quantity: Number(value)});
                                    }
                                }}

                                error={errors.available_quantity}
                            />

                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <PriceField
                                value={newProduct.purchase_price_per_item}
                                onChange={(e) => {
                                    let value = e.target.value;


                                    // Заміна коми на крапку для введення десяткових чисел

                                    // Регулярний вираз для числа з двома знаками після крапки
                                    const regex = /^\d*\.?\d{0,2}$/;

                                    // Якщо введення відповідає регулярному виразу, оновлюємо state
                                    if (regex.test(value) || value.endsWith('.')) {

                                        setNewProduct({
                                            ...newProduct,
                                            purchase_price_per_item: value === '' ? 0 : parseFloat(value)  // Оновлюємо
                                            // значення або
                                            // ставимо 0
                                        });
                                    }

                                }}

                                error={errors.price_per_item}
                            />


                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TotalPriceField value={newProduct.purchase_total_price}/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <PriceField
                                label="ціна за 1шт (продаж)"
                                value={newProduct.selling_price_per_item}
                                onChange={(e) => {
                                    let value = e.target.value;


                                    // Заміна коми на крапку для введення десяткових чисел

                                    // Регулярний вираз для числа з двома знаками після крапки
                                    const regex = /^\d*\.?\d{0,2}$/;

                                    // Якщо введення відповідає регулярному виразу, оновлюємо state
                                    if (regex.test(value) || value.endsWith('.')) {

                                        setNewProduct({
                                            ...newProduct,
                                            selling_price_per_item: value === '' ? 0 : parseFloat(value)  // Оновлюємо
                                            // значення або
                                            // ставимо 0
                                        });
                                    }

                                }}

                                error={errors.price_per_item}
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                label="Дата створення"
                                type="date"
                                value={newProduct.created_date}
                                onChange={(e) => setNewProduct({...newProduct, created_date: e.target.value})}
                                fullWidth
                                margin="normal"
                            />

                        </Grid>

                        <Grid item xs={12} md={12} marginBottom={3}>
                            <Typography>
                                Різниця в цінах за 1шт: {diffWithPrice.toFixed(2)} грн.
                            </Typography>
                        </Grid>


                    </Grid>
                    <Grid container spacing alignItems={"center"}>
                        <Grid item xs={12} sm={6} md={8}>
                            <CategoriesSelect categories={categories} selectedCategories={selectedCategories}
                                              handleCategoryChange={handleCategoryChange}/>
                        </Grid>
                    </Grid>


                </DialogContent>
                <DialogActions>
                    <Button variant={"outlined"} onClick={handleCloseAdd}>Закрити</Button>
                    <Button variant="contained" color="primary" onClick={handleAddClick} disabled={isAddButtonDisabled}>
                        Додати
                    </Button>
                </DialogActions>
            </CustomDialog>
            {modalState.openAddSupplierOpen &&
            <AddSupplierModal
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleCloseAddSupplierModal={() => handleModalClose("openAddSupplierOpen")}
            />}
        </React.Fragment>
    );
};

export default AddProductModal;
