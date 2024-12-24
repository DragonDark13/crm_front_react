import {Add} from "@mui/icons-material";
import {Box, Button, Grid, IconButton, Popover, Tooltip} from "@mui/material";
import React, {useState} from "react";
import {ICustomerDetails, INewProduct, INewSupplier, modalNames, ModalNames} from "../../utils/types";
import AddProductModal from "../dialogs/AddProductModal/AddProductModal";
import {addNewCategory, addProduct, addSupplier, createCustomer, fetchGetAllCustomers} from "../../api/api";
import {useProducts} from "../Provider/ProductContext";
import CreateNewCategoryModal from "../dialogs/CreateNewCategoryModal/CreateNewCategoryModal";
import AddSupplierModal from "../dialogs/AddSupplierModal/AddSupplierModal";
import {useCategories} from "../Provider/CategoryContext";
import {useSuppliers} from "../Provider/SupplierContext";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import AddNewCustomerDialog from "../dialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import {AxiosError} from "axios";
import {useCustomers} from "../Provider/CustomerContext";
import {useAuth} from "../context/AuthContext";

//TODO Додати опцію Зберігти і додати ще

const AddButtonWithMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const {showSnackbarMessage} = useSnackbarMessage()
    const {createCustomerFunc} = useCustomers(); // Отримуємо функцію з контексту


    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const [newProduct, setNewProduct] = useState<INewProduct>({
        name: '',
        supplier_id: '',
        quantity: 1,
        purchase_total_price: 0.00,
        purchase_price_per_item: 0.00,
        category_ids: [],
        created_date: new Date().toISOString().slice(0, 10),
        selling_price_per_item: 0.00,
        selling_total_price: 0.00,
        selling_quantity: 0,
    });


    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: true}));
        handleClose()
    };

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);


    const handleOpenAdd = () => {
        handleModalOpen("openAdd");
        setNewProduct((newProduct) => {
            return {
                ...newProduct,
            }
        })
    };

    const resetNewProduct = () => {
        setNewProduct({
            name: '',
            supplier_id: '',
            quantity: 1,
            purchase_total_price: 0.00,
            purchase_price_per_item: 0.00,
            category_ids: [],
            created_date: new Date().toISOString().slice(0, 10),
            selling_total_price: 0.00,
            selling_price_per_item: 0.00,
            selling_quantity: 0,

        });
    };


    const resetStatesMap = {
        openAdd: resetNewProduct,
    };

    const {fetchProductsFunc} = useProducts();
    const {fetchCategoriesFunc} = useCategories()
    const {fetchSuppliersFunc} = useSuppliers()

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
        resetStatesMap[modal]?.(); // Виклик відповідної функції скидання
    };


    const handleAddProduct = async () => {
        try {
            await addProduct(newProduct);
            await fetchProductsFunc();
            handleModalClose('openAdd');
            showSnackbarMessage('Product added successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error adding the product!', error);
            showSnackbarMessage('Failed to add the product!', 'error'); // Show error message
        }
    };

    const handleCategoryChange = (categoryId: number) => {

        setSelectedCategories((prevState: number[]) => {
            if (prevState.includes(categoryId)) {
                return prevState.filter(id => id !== categoryId); // Якщо категорія вибрана — видаляємо її
            } else {
                return [...prevState, categoryId]; // Якщо не вибрана — додаємо
            }
        });


        setNewProduct((prevProduct) => {
            const updatedCategories = prevProduct.category_ids.includes(categoryId)
                ? prevProduct.category_ids.filter(id => id !== categoryId) // Відміна вибору
                : [...prevProduct.category_ids, categoryId]; // Додавання вибраної категорії

            return {
                ...prevProduct,
                category_ids: updatedCategories // Оновлення категорій
            };
        });
    };

    const createNewCategory = (categoryName: string) => {
        addNewCategory(categoryName).then(() => {
            fetchCategoriesFunc();

            handleModalClose("openCategoryCreate"); // Закрити модальне вікно після додавання
            showSnackbarMessage('Category added successfully!', 'success'); // Show success message

        })
            .catch(error => {
                showSnackbarMessage('Failed to add the Category!', 'error'); // Show error message

                console.error('There was an error adding the product!', error);
            });
    };


    const handleAddSupplier = (newSupplier: INewSupplier) => {

        addSupplier(newSupplier)
            .then(() => {
                handleModalClose("openAddSupplierOpen");
                fetchSuppliersFunc(); // Оновити список постачальників після додавання
                showSnackbarMessage('Supplier completed successfully!', 'success'); // Show success message

            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbarMessage('There was an error saving the supplier!', "error");
            });
    };

    const [newCustomerData, setNewCustomerData] = useState<ICustomerDetails>({
        id: 0,
        name: '',
        email: '',
        phone_number: '',
        address: '',
    });

    const handleCreateCustomer = (newCustomerData: ICustomerDetails) => {

        createCustomerFunc(newCustomerData)
            .then(() => {
                handleModalClose('createCustomerDialog'); // Закриваємо діалогове вікно
            })
            .catch((error: AxiosError) => {
                console.error('Error creating customer:', error);
                showSnackbarMessage('Error creating customer: ' + error.response?.data?.error || 'Unknown error', 'error');
            });
    };

    const {isAuthenticated} = useAuth();


    return (
        <Box>
            <Tooltip title="Додати" placement="right">
                <IconButton disabled={!isAuthenticated} color="primary" onClick={handleClick}>
                    <Add/>
                </IconButton>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Box sx={{p: 2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth onClick={handleOpenAdd}>
                                Товар
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth
                                    onClick={() => handleModalOpen("openCategoryCreate")}>
                                Категорію
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth
                                    onClick={() => handleModalOpen("openAddSupplierOpen")}>
                                Постачальника
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth
                                    onClick={() => handleModalOpen("createCustomerDialog")}>
                                Покупця
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </Popover>
            {
                modalState.openAdd && <AddProductModal

                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    openAdd={modalState.openAdd}
                    handleAdd={handleAddProduct}
                    handleCategoryChange={handleCategoryChange}
                    handleCloseAdd={() => handleModalClose("openAdd")}
                    selectedCategories={selectedCategories}/>
            }
            {
                modalState.openCategoryCreate &&
                <CreateNewCategoryModal
                    createNewCategory={createNewCategory}
                    openCategoryCreateModal={modalState.openCategoryCreate}
                    handleCloseCategoryModal={() => handleModalClose("openCategoryCreate")}
                />
            }

            {modalState.openAddSupplierOpen && <AddSupplierModal
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleClose={() => handleModalClose("openAddSupplierOpen")}
            />}

            {modalState.createCustomerDialog && <AddNewCustomerDialog
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
                openAddNewCustomerDialog={modalState.createCustomerDialog}
                handleCloseAddNewCustomerDialog={() => handleModalClose("createCustomerDialog")}
                handleAddCustomer={handleCreateCustomer}/>}


        </Box>
    );
};

export default AddButtonWithMenu;
