import {
    TextField,
    Button,
    useMediaQuery,
    DialogContent,
    DialogActions,
    Grid,
    Typography,
    Box, Collapse, Paper, Autocomplete, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import CustomDialog from "../../CustomDialog/CustomDialog";
import {useEffect, useState} from "react";
import QuantityField from "../../../FormComponents/QuantityField";
import {roundToDecimalPlaces} from "../../../../utils/function";
import TotalPriceField from "../../../FormComponents/TotalPriceField";
import {
    ICustomer,
    ICustomerDetails,
    IMaterial,
    INewGiftCustomerDetails,
    ISaleData,
    ISaleProductModal
} from "../../../../utils/types";
import {useCustomers} from "../../../Provider/CustomerContext";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import {usePackaging} from "../../../Provider/PackagingContext";
import {AxiosError} from "axios";
import {useSnackbarMessage} from "../../../Provider/SnackbarMessageContext";
import AddNewCustomerDialog from "../../CustomersDialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import React from "react";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {createCustomer, fetchGetAllCustomers} from "../../../../api/_customer";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddButton from "../../../Buttons/AddButton";
import DateFieldCustom from "../../../FormComponents/DateFieldCustom";
import PackagingSelector from "./PackagingSelector";
import CancelButton from "../../../Buttons/CancelButton";
//TODO check create customer
//TODO choise added customer create interface

const SaleProductModal = ({
                              openSale,
                              handleCloseSale,
                              saleData,
                              setSaleData,
                              handleSale,
                              nameProduct,
                              purchasePricePerItem,
                              quantityOnStock,
                              isAuthenticated
                          }: ISaleProductModal) => {

    const isMobile = useMediaQuery("(max-width:700px)");
    const {customers, fetchGetAllCustomersFunc, createCustomerFunc} = useCustomers();
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
    const [newCustomerData, setNewCustomerData] = useState<INewGiftCustomerDetails>({
        contact_info: "",
        sales: [],
        name: '', email: '', phone_number: '', address: ''
    });

    const resetNewCustomerData = () => {
        setNewCustomerData({
            contact_info: "",
            sales: [],
            name: '', email: '', phone_number: '', address: ''
        })
    }


    const togglePackaging = () => {
        setShowPackaging(!showPackaging); // Перемикаємо видимість полів пакування
    };

    const removePackage = () => {
        setSaleData({...saleData, packaging_id: '', packaging_quantity: 0});
        togglePackaging();
    }


    useEffect(() => {
        if (openSale) {
            fetchGetAllCustomersFunc();
            fetchPackagingOptions(); // Завантажуємо доступні пакувальні матеріали
        }
    }, [openSale, fetchGetAllCustomersFunc, fetchPackagingOptions]);

    const [errors, setErrors] = useState({
        customer: '',
        sale_date: '',
        price_per_item: '',
        quantity: '',
        packaging: '',
    });

    const validateFields = () => {
        const newErrors = {
            customer: saleData.customer === '' ? 'Обери покупця' : '',
            sale_date: saleData.sale_date === '' ? 'Вкажи дату продажу' : '',
            price_per_item: saleData.selling_price_per_item <= 0 ? 'Ціна продажу має бути більшою за нуль' : '',
            quantity: saleData.quantity <= 0 || saleData.quantity > quantityOnStock ? `Кількість має бути від 1 до ${quantityOnStock} шт.` : '',
            packaging: saleData.packaging_id !== '' && saleData.packaging_quantity < 1 ? 'Вкажи кількість пакування більше нуля' : '',
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSaleSubmit = () => {
        if (validateFields()) {
            handleSale();
        }
    };

    const handleCreateCustomer = (newCustomerData: INewGiftCustomerDetails) => {

        createCustomerFunc(newCustomerData)
            .then(response => {
                console.log('Response:', response); // Лог для перевірки відповіді
                setOpenAddNewCustomerDialog(false);
                showSnackbarMessage('Customer created successfully!', 'success')
                // Закриваємо модальне вікно після створення
            })
            .catch((error: AxiosError) => {
                console.log('Error Response:', error.response); // Лог для перевірки помилки

                showSnackbarMessage('Error creating customer: ' + error.message, 'error')
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
    }, [saleData.quantity, saleData.selling_price_per_item, saleData.purchase_price_per_item, saleData.packaging_id, saleData.packaging_quantity, packagingMaterials, setSaleData]);

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
    const totalCostOnlyProduct = roundToDecimalPlaces(saleData.purchase_price_per_item * saleData.quantity, 2);

    const totalCost = roundToDecimalPlaces(saleData.total_cost_price, 2);
    const cleanProfit = roundToDecimalPlaces(totalSalePrice - saleData.quantity * purchasePricePerItem - totalPackagingCost, 2);

    const handleChangeCustomer = (id: number) => {
        setSaleData({
            ...saleData,
            customer: !isNaN(id) ? id : ""
        });
    }

    const handleChangeSaleDate = (date: string) => {
        setSaleData({...saleData, sale_date: date})
    }

    const handleChangeQuantitySaleProduct = (value: string) => {
        let quantity = value.replace(/[^0-9]/g, '');

        if (quantity.startsWith('0')) {
            quantity = quantity.replace(/^0+/, ''); // Видаляє всі ведучі нулі
        }

        if (/^\d+$/.test(quantity)) {  // Перевіряємо, чи значення складається тільки з цифр
            // Застосовуємо межі
            if (Number(quantity) < 1) {
                setSaleData({...saleData, quantity: 1});
            } else if (Number(quantity) > Number(quantityOnStock)) {
                setSaleData({...saleData, quantity: quantityOnStock});
            } else {
                setSaleData({...saleData, quantity: Number(quantity)});
            }

        }

    }

    return (
        <React.Fragment>
            <CustomDialog
                open={openSale}
                handleClose={handleCloseSale}
                title={`Продаж '${nameProduct}' x ${saleData.quantity}шт`}
                maxWidth="md"
                fullScreen={isMobile}
            >
                <React.Fragment>
                    <DialogContent>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Товар для продажу</Typography>
                                <Typography fontWeight="bold" variant="subtitle1">
                                    {nameProduct}
                                </Typography>
                                {quantityOnStock < 1 && (
                                    <Typography color="error">Товару немає в наявності на складі</Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" sx={{mt: 0.5, mb: 1.5}}>
                                    Доступно для продажу: {quantityOnStock} шт.
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container alignItems={"end"} spacing={2}>
                            <Grid item xs={9} sm={6} md={4} lg={4}>
                                <Autocomplete
                                    disabled={quantityOnStock < 1}
                                    options={customers}
                                    value={customers.find(customer => customer.id === saleData.customer) ?? null}
                                    getOptionLabel={(customer) => customer.name}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    onChange={(_, customer) => {
                                        handleChangeCustomer(customer?.id ?? NaN);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            label="Покупець"
                                            placeholder="Почни вводити ім’я покупця"
                                            error={!!errors.customer}
                                            helperText={errors.customer || "Знайди покупця у списку або додай нового кнопкою +"}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={3} sm={2}>
                                <AddButton disabled={quantityOnStock < 1}
                                           onClick={() => setOpenAddNewCustomerDialog(true)}/>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    disabled={quantityOnStock < 1}
                                    sx={{marginBottom: 0}}
                                    size={"small"}
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

                        </Grid>
                        {quantityOnStock > 0 && <Grid item xs={12} sm={6} md={4}>
                            <Typography> Максимальна кількість {quantityOnStock}шт</Typography>
                        </Grid>}
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid item xs={12} sm={6} md={3}>
                                <QuantityField
                                    disabled={quantityOnStock < 1}
                                    onIncrement={incrementQuantity}
                                    onDecrement={decrementQuantity}
                                    value={saleData.quantity}
                                    onChange={(e) => handleChangeQuantitySaleProduct(e.target.value)}
                                    max={quantityOnStock}
                                    error={errors.quantity!==''}
                                    helperText={errors.quantity}
                                />
                            </Grid>





                        </Grid>
                        <Accordion
                            disableGutters
                            elevation={0}
                            sx={{mt: 2, border: 1, borderColor: 'divider', '&:before': {display: 'none'}}}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <Typography fontWeight="medium">Додаткові параметри</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Дата продажу: {saleData.sale_date} · пакування за потреби
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={5}>
                                        <DateFieldCustom
                                            disabled={quantityOnStock < 1}
                                            label="Дата продажу"
                                            value={saleData.sale_date}
                                            onChange={(e) => handleChangeSaleDate(e.target.value)}
                                            error={!!errors.sale_date}
                                            helperText={errors.sale_date}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        {!showPackaging && (
                                            <Button
                                                disabled={quantityOnStock < 1}
                                                variant="outlined"
                                                startIcon={<AddIcon/>}
                                                onClick={togglePackaging}
                                            >
                                                Додати пакування
                                            </Button>
                                        )}
                                        {showPackaging && (
                                            <PackagingSelector
                                                saleData={saleData}
                                                setSaleData={setSaleData}
                                                packagingMaterials={packagingMaterials}
                                                removePackage={removePackage}
                                            />
                                        )}
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                        <Grid container spacing={3} sx={{mt: 1}}>
                            {/* Загальна Чиста Вигода */}
                            <Grid item xs={12} sm={6}>
                                <Paper sx={{padding: 2, backgroundColor: '#dfdfdf'}}>
                                    <Typography variant="h6" sx={{color: 'green'}}>
                                        Орієнтовний прибуток:
                                        <span style={{fontWeight: 'bold', color: 'green'}}>{cleanProfit} грн.</span>
                                    </Typography>
                                    <Typography component={"div"} variant="body2" color="textSecondary">
                                        Розрахунок:
                                        <Collapse in={expanded}>
                                            <ul>
                                                <li>Сума продажу: <strong>{totalSalePrice} грн.</strong></li>
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
                                <Paper sx={{padding: 2, backgroundColor: '#dfdfdf'}}>
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
                                                <li>Загальна Собівартість
                                                    товару: <strong>{totalCostOnlyProduct} грн.</strong></li>
                                                <li>Загальна Собівартість
                                                    пакування: <strong>{totalPackagingCost} грн.</strong></li>
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
                    <DialogActions sx={isMobile ? {
                        position: "sticky",
                        bottom: 0,
                        zIndex: 1,
                        justifyContent: "space-between",
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        pb: "calc(12px + env(safe-area-inset-bottom))",
                        backgroundColor: "background.paper",
                        borderTop: 1,
                        borderColor: "divider",
                    } : undefined}>
                        {/*<Button variant="contained" onClick={handleCloseSale} color="error">*/}
                        {/*    Відміна*/}
                        {/*</Button>*/}
                        {isMobile && (
                            <Typography fontWeight="bold" sx={{whiteSpace: "nowrap"}}>
                                {totalSalePrice.toFixed(2)} грн
                            </Typography>
                        )}
                        <CancelButton onClick={handleCloseSale}/>
                        <Button
                            variant="contained"
                            fullWidth={isMobile}
                            onClick={handleSaleSubmit}
                            disabled={isSubmitDisabled() || !isAuthenticated || quantityOnStock < 1} // Додаємо
                            // перевірку для активності
                            // кнопки
                        >
                            Зберегти продаж
                        </Button>
                    </DialogActions>
                </React.Fragment>
            </CustomDialog>
            <AddNewCustomerDialog
                isAuthenticated={isAuthenticated}
                handleAddCustomer={handleCreateCustomer}
                handleCloseAddNewCustomerDialog={() => {
                    setOpenAddNewCustomerDialog(false)
                    resetNewCustomerData();
                }}
                openAddNewCustomerDialog={openAddNewCustomerDialog}
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
            />
        </React.Fragment>

    );
};

export default SaleProductModal;
