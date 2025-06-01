import React, {useState} from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Divider,
    DialogContent,
    DialogActions,
    InputLabel, Select, MenuItem, FormControl
} from '@mui/material';
import CustomDialog from "../../dialogs/CustomDialog/CustomDialog";
import {useCustomers} from "../../Provider/CustomerContext";
import AddIcon from "@mui/icons-material/Add";
import {ICustomerDetails, IGiftSet, INewGiftCustomerDetails} from "../../../utils/types";
import AddNewCustomerDialog from "../../dialogs/CustomersDialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import {AxiosError} from "axios";
import {useSnackbarMessage} from "../../Provider/SnackbarMessageContext";
import CancelButton from "../../Buttons/CancelButton";
import DateFieldCustom from "../../FormComponents/DateFieldCustom";
import PriceField from "../../FormComponents/PriceField";
import CustomerSelect from "../../FormComponents/CustomerSelect";
import AddButton from "../../Buttons/AddButton";

interface IGiftSetSaleModalProps {
    open: boolean;
    onClose: () => void;
    giftSet: any; // Модель даних набору
    handleGiftSell: (
        giftSet: IGiftSet,
        customer: number | null,
        saleDate: string | null,
        sellingPrice: number,
    ) => void,
    loading: boolean,
    error: string | null,
    isAuthenticated: boolean
}

const GiftSetSaleModal: React.FC<IGiftSetSaleModalProps> = ({
                                                                open,
                                                                onClose,
                                                                giftSet,
                                                                error,
                                                                handleGiftSell,
                                                                loading,
                                                                isAuthenticated
                                                            }) => {
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]); // Встановлення поточної дати за замовчуванням
    const [sellingPrice, setSellingPrice] = useState<number>(giftSet.gift_selling_price || 0);
    const [customer, setCustomer] = useState<number>('');
    const [customerName, setCustomerName] = useState<string>('');

    const {customers, fetchGetAllCustomersFunc, createCustomerFunc} = useCustomers();
    const {showSnackbarMessage} = useSnackbarMessage();

    console.log("isAuthenticated1 GiftSetSaleModal", isAuthenticated);


    const calculateTotalCost = () => {
        const packagingCost = giftSet.packagings.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
        );
        const productCost = giftSet.products.reduce(
            (total: number, item: any) => total + item.price * item.quantity,
            0
        );
        return packagingCost + productCost;
    };

    // const handleGiftSell = async () => {
    //     if (!customer) { // Перевірка чи вибрано покупця
    //         showSnackbarMessage('Please select a customer to proceed with the sale.', 'error');
    //         return;
    //     }
    //
    //     setLoading(true);
    //     setError(null);
    //
    //     const requestData = {
    //         gift_set_id: giftSet.id,
    //         customer_id: customer,
    //         sale_date: saleDate,
    //         selling_price: sellingPrice
    //     };
    //
    //     try {
    //         const result = await sellGiftSet(requestData);
    //         onClose();
    //     } catch (err: any) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const [openAddNewCustomerDialog, setOpenAddNewCustomerDialog] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState<INewGiftCustomerDetails>({
        contact_info: "",
        sales: [],
        name: '',
        email: '',
        phone_number: '',
        address: ''
    });

    const resetNewCustomerDataModal = () => {

        setNewCustomerData({
            contact_info: "",
            sales: [],
            name: '',
            email: '',
            phone_number: '',
            address: ''
        })
    }

    const handleCreateCustomer = (newCustomerData: INewGiftCustomerDetails) => {
        createCustomerFunc(newCustomerData)
            .then(response => {
                console.log('Response:', response);
                setOpenAddNewCustomerDialog(false);
                resetNewCustomerDataModal()
                showSnackbarMessage('Customer created successfully!', 'success');
            })
            .catch((error: AxiosError) => {
                console.log('Error Response:', error.response);
                showSnackbarMessage('Error creating customer: ' + error.response.data.error, 'error');
            });
    };

    return (
        <React.Fragment>
            <CustomDialog
                open={open}
                handleClose={onClose}
                title={`Продаж  подарункового набору ${giftSet.name}`}
                maxWidth="md"
            >
                <DialogContent>

                    <Typography variant="subtitle1">
                        <strong>Назва:</strong> {giftSet.name}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Опис:</strong>
                        {giftSet.description}</Typography>

                    <Divider sx={{my: 2}}/>

                    <Typography variant="h6">Склад набору</Typography>
                    {giftSet.products.map((product: any, index: number) => (
                        <Grid container key={index} sx={{mb: 1}}>
                            <Grid item xs={5}>{product.name}</Grid>
                            <Grid item xs={3}>{product.price} UAH</Grid>
                            <Grid item xs={1}>{product.quantity} шт</Grid>
                            <Grid item xs={3}>Total: {(product.price * product.quantity).toFixed(2)} UAH</Grid>
                        </Grid>
                    ))}

                    {giftSet.packagings.map((packaging: any, index: number) => (
                        <Grid container key={index} sx={{mb: 1}}>
                            <Grid item xs={5}>{packaging.name}</Grid>
                            <Grid item xs={3}>{packaging.price} UAH</Grid>
                            <Grid item xs={1}>{packaging.quantity} шт</Grid>
                            <Grid item xs={3}>Total: {(packaging.price * packaging.quantity).toFixed(2)} UAH</Grid>
                        </Grid>
                    ))}

                    <Divider sx={{my: 2}}/>

                    <Typography variant="h6">
                        Собівартість: {calculateTotalCost().toFixed(2)} UAH
                    </Typography>

                    <Typography variant="h6" sx={{mt: 1}}>
                        Вигода: {(sellingPrice - calculateTotalCost()).toFixed(2)} UAH
                    </Typography>
                    <Grid container alignItems={"center"} spacing={2}>
                        <Grid item xs={12} md={3}>
                            <DateFieldCustom label="Sale Date" value={saleDate}
                                             onChange={(e) => setSaleDate(e.target.value)}/>
                            {/*<TextField*/}
                            {/*    label="Sale Date"*/}
                            {/*    type="date"*/}
                            {/*    value={saleDate}*/}
                            {/*    onChange={(e) => setSaleDate(e.target.value)}*/}
                            {/*    fullWidth*/}
                            {/*    sx={{my: 2}}*/}
                            {/*    InputLabelProps={{shrink: true}}*/}
                            {/*/>*/}

                        </Grid>
                        <Grid item xs={12} md={3}>
                            <PriceField sx={{marginBottom: 0}} label="Selling Price" value={sellingPrice}
                                        onChange={(e) => setSellingPrice(parseFloat(e.target.value))}/>
                            {/*<TextField*/}
                            {/*    label="Selling Price"*/}
                            {/*    type="number"*/}
                            {/*    value={sellingPrice}*/}
                            {/*    onChange={(e) => setSellingPrice(parseFloat(e.target.value))}*/}
                            {/*    fullWidth*/}
                            {/*    sx={{my: 2}}*/}
                            {/*/>*/}

                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Grid container alignItems={"center"} spacing={2}>
                                <Grid item xs={12} sm={8}>
                                    <CustomerSelect customers={customers} value={customer} onChange={(e) => {
                                        const selectedCustomer = Number(e.target.value);
                                        setCustomer(selectedCustomer)
                                    }}/>

                                    {/*<FormControl fullWidth margin="normal">*/}
                                    {/*    <InputLabel id="supplier-select-label">Покупець</InputLabel>*/}
                                    {/*    <Select*/}
                                    {/*        label="Покупець"*/}
                                    {/*        value={customer}*/}
                                    {/*        onChange={(e) => setCustomer(e.target.value)}*/}
                                    {/*        fullWidth*/}
                                    {/*    >*/}
                                    {/*        {customers.map((customer) => (*/}
                                    {/*            <MenuItem key={customer.id + customer.name} value={customer.id}>*/}
                                    {/*                {customer.name}*/}
                                    {/*            </MenuItem>*/}
                                    {/*        ))}*/}
                                    {/*    </Select>*/}
                                    {/*</FormControl>*/}
                                </Grid>
                                <Grid item xs={12} sm={4} mt={2}>
                                    <AddButton onClick={() => setOpenAddNewCustomerDialog(true)}/>

                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>


                </DialogContent>

                <DialogActions>
                    <CancelButton onClick={onClose} disabled={loading} sx={{mr: 1}}/>

                    <Button
                        color="primary"

                        onClick={() => handleGiftSell(giftSet, customer, saleDate, sellingPrice)}
                        variant="contained"
                        disabled={loading|| !isAuthenticated}
                    >
                        {loading ? 'Processing...' : 'Продати'}
                    </Button>
                </DialogActions>
            </CustomDialog>
            <AddNewCustomerDialog
                isAuthenticated={isAuthenticated}
                handleAddCustomer={handleCreateCustomer}
                handleCloseAddNewCustomerDialog={() => {
                    setOpenAddNewCustomerDialog(false)
                    resetNewCustomerDataModal()
                }}
                openAddNewCustomerDialog={openAddNewCustomerDialog}
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
            />
        </React.Fragment>
    );
};

export default GiftSetSaleModal;
