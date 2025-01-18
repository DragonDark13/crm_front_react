import {
    TextField,
    Button,
    DialogContent,
    DialogActions,
    Grid,
    Typography,
    Select,
    MenuItem,
    InputLabel, FormControl, Collapse, Paper
} from '@mui/material';
import CustomDialog from "../CustomDialog/CustomDialog";
import {useEffect, useState} from "react";
import QuantityField from "../../FormComponents/QuantityField";
import {roundToDecimalPlaces} from "../../../utils/function";
import TotalPriceField from "../../FormComponents/TotalPriceField";
import {ICustomer, ICustomerDetails, IMaterial, ISaleData} from "../../../utils/types";
import {useCustomers} from "../../Provider/CustomerContext";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {usePackaging} from "../../Provider/PackagingContext";
import {AxiosError} from "axios";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import AddNewCustomerDialog from "../AddNewCustomerDialog/AddNewCustomerDialog";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {createCustomer, fetchGetAllCustomers} from "../../../api/_customer";


interface ISaleProductModal {
    openSale: boolean;
    handleCloseSale: () => void;
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    handleSale: () => void;
    nameProduct: string;
    purchasePricePerItem: number
    quantityOnStock: number,
}

const SaleProductModal = ({
                              openSale,
                              handleCloseSale,
                              saleData,
                              setSaleData,
                              handleSale,
                              nameProduct,
                              purchasePricePerItem,
                              quantityOnStock
                          }: ISaleProductModal) => {

    const {customers, fetchCustomersFunc, createCustomerFunc} = useCustomers();
    const {packagingMaterials, fetchPackagingOptions} = usePackaging();
    const [expanded, setExpanded] = useState(false);
    const {showSnackbarMessage} = useSnackbarMessage()


// Функція для перемикання стану розгортання
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // Створення стану для відображення полів пакування
    const [showPackaging, setShowPackaging] = useState(false);
    const [openAddNewCustomerDialog, setOpenAddNewCustomerDialog] = useState(false); // Створення стану для діалогу додавання покупця
    const [newCustomerData, setNewCustomerData] = useState<ICustomerDetails>({
        contact_info: "",
        id: 0,
        sales: [],
        name: '', email: '', phone_number: '', address: ''
    });
    const togglePackaging = () => {
        setShowPackaging(!showPackaging); // Перемикаємо видимість полів пакування
    };

    const removePackage = () => {
        setSaleData({...saleData, packaging_id: '', packaging_quantity: 0});
        togglePackaging();
    }


    useEffect(() => {
        if (openSale) {
            fetchCustomersFunc();
            fetchPackagingOptions(); // Завантажуємо доступні пакувальні матеріали
        }
    }, [openSale]);

    const [errors, setErrors] = useState({
        customer: '',
        sale_date: '',
        price_per_item: '',
        quantity: '',
        packaging: '',
    });

    const validateFields = () => {
        const newErrors = {
            customer: saleData.customer === '' ? 'Customer name is required' : '',
            sale_date: saleData.sale_date === '' ? 'Sale date is required' : '',
            price_per_item: saleData.selling_price_per_item <= 0 ? 'Price per item must be greater than 0' : '',
            quantity: saleData.quantity <= 0 || saleData.quantity > quantityOnStock ? 'Quantity must be greater than 0' : '',
            packaging: saleData.packaging_id !== '' && saleData.packaging_quantity < 1 ? 'Quantity must be greater' +
                ' than 0' : '',
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSaleSubmit = () => {
        if (validateFields()) {
            handleSale();
        }
    };

    const handleCreateCustomer = (newCustomerData: ICustomerDetails) => {
        debugger
        createCustomerFunc(newCustomerData)
            .then(response => {
                console.log('Response:', response); // Лог для перевірки відповіді
                setOpenAddNewCustomerDialog(false);
                showSnackbarMessage('Customer created successfully!', 'success')
                // Закриваємо модальне вікно після створення
            })
            .catch((error: AxiosError) => {
                console.log('Error Response:', error.response); // Лог для перевірки помилки

                showSnackbarMessage('Error creating customer: ' + error.response.data.error, 'error')
                console.error('Error creating customer:', error);
            });
    };

    useEffect(() => {
        const totalPackagingCost = saleData.packaging_id && saleData.packaging_quantity > 0
            ? saleData.packaging_quantity * (packagingMaterials.find(material => material.id === saleData.packaging_id)?.purchase_price_per_unit || 0)
            : 0;

        const totalPrice = saleData.quantity * saleData.selling_price_per_item;
        const totalCostWitoutPAckaging = saleData.purchase_price_per_item * saleData.quantity;

        setSaleData({
            ...saleData,
            total_packaging_cost: totalPackagingCost,
            selling_total_price: roundToDecimalPlaces(totalPrice, 2),
            total_cost_price: roundToDecimalPlaces(totalCostWitoutPAckaging + totalPackagingCost, 2)
        });
    }, [saleData.quantity, saleData.selling_price_per_item, saleData.packaging_id, saleData.packaging_quantity]);

    const incrementQuantity = () => {
        if (saleData.quantity < quantityOnStock) {
            setSaleData({
                ...saleData,
                quantity: saleData.quantity + 1
            });
        }
    };

    const decrementQuantity = () => {
        if (saleData.quantity > 1) {
            setSaleData({
                ...saleData,
                quantity: saleData.quantity - 1 // Виправлено на зменшення значення
            });
        }
    };

    const isSubmitDisabled = () => {
        return (
            saleData.customer === '' ||
            saleData.selling_price_per_item <= 0 ||
            saleData.quantity <= 0 || saleData.quantity > quantityOnStock ||
            (saleData.packaging_id !== '' &&
                saleData.packaging_quantity < 1)
        );
    };

    const packagingPrice = saleData.packaging_quantity > 0 && saleData.packaging_id
        ? (packagingMaterials.find(material => material.id === saleData.packaging_id)?.purchase_price_per_unit || 0)
        : 0;

    const totalSalePrice = roundToDecimalPlaces(saleData.selling_total_price, 2);
    const totalPackagingCost = roundToDecimalPlaces(saleData.packaging_quantity * packagingPrice, 2);
    const totalCost = roundToDecimalPlaces(saleData.total_cost_price, 2);
    const cleanProfit = roundToDecimalPlaces(totalSalePrice - saleData.quantity * purchasePricePerItem - totalPackagingCost, 2);

    return (
        <React.Fragment>
            <CustomDialog
                open={openSale}
                handleClose={handleCloseSale}
                title={`Продаж ${nameProduct} x ${saleData.quantity}шт`}
                maxWidth="md"
            >
                <React.Fragment>
                    <DialogContent>
                        <Grid container alignItems={"center"} spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" error={!!errors.customer}>
                                    <InputLabel id="supplier-select-label">Покупець</InputLabel>
                                    <Select
                                        label="Покупець"
                                        value={saleData.customer}
                                        onChange={(e) => setSaleData({...saleData, customer: e.target.value})}
                                        fullWidth
                                    >
                                        {customers.map((customer) => (
                                            <MenuItem key={customer.id + customer.name} value={customer.id}>
                                                {customer.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.customer && <span className="error">{errors.customer}</span>}
                                </FormControl>
                                {/* Кнопка для додавання нового покупця */}

                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <Button size={"large"} variant={"contained"} endIcon={<AddIcon/>}
                                        onClick={() => setOpenAddNewCustomerDialog(true)}
                                        color="secondary">
                                    Додати
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Дата продажу"
                                    type="date"
                                    value={saleData.sale_date}
                                    onChange={(e) => setSaleData({...saleData, sale_date: e.target.value})}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.sale_date}
                                    helperText={errors.sale_date}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography> Максимальна кількість {quantityOnStock}шт</Typography>
                        </Grid>
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid item xs={12} sm={6} md={3}>
                                <QuantityField
                                    onIncrement={incrementQuantity}
                                    onDecrement={decrementQuantity}
                                    value={saleData.quantity}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        value = value.replace(/[^0-9]/g, '');

                                        if (value.startsWith('0')) {
                                            value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                        }

                                        if (/^\d+$/.test(value)) {  // Перевіряємо, чи значення складається тільки з цифр
                                            setSaleData({...saleData, quantity: Number(value)});
                                        }
                                    }}
                                    error={errors.quantity}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    label="Ціна за 1шт (Продаж)"
                                    type="number"
                                    value={saleData.selling_price_per_item}
                                    onChange={(e) => setSaleData({
                                        ...saleData,
                                        selling_price_per_item: Number(e.target.value)
                                    })}
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.price_per_item}
                                    helperText={errors.price_per_item}
                                    inputProps={{min: 1, max: 100000}}  // Обмеження значень
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={12}>
                                {/* Кнопка для додавання пакування */}
                                {!showPackaging && <Grid item xs={12}>
                                    <Button variant={"contained"} endIcon={<AddIcon/>} onClick={togglePackaging}
                                            color="secondary">
                                        {showPackaging ? 'Приховати пакування' : 'Додати пакування'}
                                    </Button>
                                </Grid>}

                                {/* Поля для пакування, які з'являються після натискання кнопки */}
                                {showPackaging && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel id="packaging-select-label">Пакування</InputLabel>
                                                <Select
                                                    label="Пакування"
                                                    value={saleData.packaging_id || ''}
                                                    onChange={(e) => setSaleData({
                                                        ...saleData,
                                                        packaging_id: e.target.value
                                                    })}
                                                    fullWidth
                                                >
                                                    {packagingMaterials.map((material: IMaterial) => (
                                                        <MenuItem key={material.id} value={material.id}>
                                                            {material.name} (Доступно: {material.available_quantity})
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {/*{errors.packaging && <span className="error">{errors.packaging}</span>}*/}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            {saleData.packaging_id === '' ? (
                                                <Typography variant="body2" color="error">
                                                    Спочатку оберіть пакування
                                                </Typography>
                                            ) : (
                                                <QuantityField
                                                    label="Кількість пакування"
                                                    readonly={saleData.packaging_id === ''}
                                                    onIncrement={() => setSaleData({
                                                        ...saleData,
                                                        packaging_quantity: saleData.packaging_quantity + 1
                                                    })}
                                                    onDecrement={() => {
                                                        if (saleData.packaging_quantity > 0) {
                                                            setSaleData({
                                                                ...saleData,
                                                                packaging_quantity: saleData.packaging_quantity - 1
                                                            });
                                                        }
                                                    }}
                                                    value={saleData.packaging_quantity}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        value = value.replace(/[^0-9]/g, ''); // Видаляє все, крім цифр

                                                        if (value.startsWith('0')) {
                                                            value = value.replace(/^0+/, ''); // Видаляє всі ведучі нулі
                                                        }

                                                        if (/^\d+$/.test(value)) {
                                                            setSaleData({
                                                                ...saleData,
                                                                packaging_quantity: Number(value)
                                                            });
                                                        }
                                                    }}
                                                    // error={errors.packaging_quantity}
                                                />
                                            )}
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Typography>
                                                Собівартість пакування за 1 одиницю: {roundToDecimalPlaces(
                                                saleData.packaging_id
                                                    ? (packagingMaterials.find(material => material.id === saleData.packaging_id)?.purchase_price_per_unit || 0)
                                                    : 0, 2)} грн.
                                            </Typography>

                                            <Typography>
                                                Кількість у наявності: {
                                                saleData.packaging_id
                                                    ? (packagingMaterials.find(material => material.id === saleData.packaging_id)?.available_quantity || 0)
                                                    : 0}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button variant={"contained"} endIcon={<DeleteIcon/>}
                                                    onClick={removePackage}
                                                    color="secondary">
                                                Видалити пакування
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TotalPriceField label={"Загальна сума (Продаж)"} value={saleData.selling_total_price}/>
                            </Grid>


                        </Grid>
                        <Grid container spacing={3}>
                            {/* Загальна Чиста Вигода */}
                            <Grid item xs={12} sm={6}>
                                <Paper sx={{padding: 2, backgroundColor: '#f4f8f4'}}>
                                    <Typography variant="h6" sx={{color: 'green'}}>
                                        Чиста Вигода з продажу:
                                        <span style={{fontWeight: 'bold', color: 'green'}}>{cleanProfit} грн.</span>
                                    </Typography>
                                    <Typography component={"div"} variant="body2" color="textSecondary">
                                        Розрахунок:
                                        <Collapse in={expanded}>
                                            <ul>
                                                <li>Загальна сума продажу: <strong>{totalSalePrice} грн.</strong></li>
                                                <li>Ціна товару за
                                                    1шт: <strong>{roundToDecimalPlaces(totalSalePrice / saleData.quantity, 2)} грн.</strong>
                                                </li>
                                                <li>Собівартість пакування за 1
                                                    одиницю: <strong>{packagingPrice} грн.</strong></li>
                                                <li>Чиста вигода: <strong>{cleanProfit} грн.</strong></li>
                                            </ul>
                                        </Collapse>
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Загальна собівартість */}
                            <Grid item xs={12} sm={6}>
                                <Paper sx={{padding: 2, backgroundColor: '#f4f8f4'}}>
                                    <Typography variant="h6" sx={{color: 'red'}}>
                                        Загальна собівартість:
                                        <span style={{fontWeight: 'bold', color: 'red'}}>{totalCost} грн.</span>
                                    </Typography>
                                    <Typography component={"div"} variant="body2" color="textSecondary">
                                        Розрахунок собівартості:
                                        <Collapse in={expanded}>
                                            <ul>
                                                <li>Собівартість товару за
                                                    1шт: <strong>{purchasePricePerItem} грн.</strong></li>
                                                <li>Собівартість пакування за 1
                                                    одиницю: <strong>{packagingPrice} грн.</strong></li>
                                                <li>Загальна собівартість: <strong>{totalCost} грн.</strong></li>
                                            </ul>
                                        </Collapse>
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Кнопка для детальнішого перегляду */}
                            <Grid item xs={12}>
                                <Button
                                    endIcon={<KeyboardArrowDownIcon/>}
                                    variant="contained"
                                    onClick={toggleExpanded}
                                    size="small"
                                    sx={{backgroundColor: '#3f51b5', '&:hover': {backgroundColor: '#303f9f'}}}
                                >
                                    {expanded ? 'Згорнути' : 'Детальніше'}
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSale} color="primary">
                            Відміна
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaleSubmit}
                            disabled={isSubmitDisabled()} // Додаємо перевірку для активності кнопки
                        >
                            Підтвердити продаж
                        </Button>
                    </DialogActions>
                </React.Fragment>
            </CustomDialog>
            <AddNewCustomerDialog
                handleAddCustomer={handleCreateCustomer}
                handleCloseAddNewCustomerDialog={() => setOpenAddNewCustomerDialog(false)}
                openAddNewCustomerDialog={openAddNewCustomerDialog}
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
            />
        </React.Fragment>

    );
};

export default SaleProductModal;
