import {Box, Button, Grid, IconButton, Popover, Tooltip} from "@mui/material";
import React, {useState} from "react";
import {
    GiftSetPayload,
    ICustomerDetails, IHandleAddNewGiftBox,
    INewProduct,
    INewSupplier,
    IPurchasePackagingMaterial,
    modalNames,
    ModalNames
} from "../../utils/types";
import AddProductModal from "../dialogs/productsDialogs/AddProductModal/AddProductModal";
import {useProducts} from "../Provider/ProductContext";
import CreateNewCategoryModal from "../dialogs/CreateNewCategoryModal/CreateNewCategoryModal";
import AddSupplierModal from "../dialogs/AddSupplierModal/AddSupplierModal";
import {useCategories} from "../Provider/CategoryContext";
import {useSuppliers} from "../Provider/SupplierContext";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import AddNewCustomerDialog from "../dialogs/CustomersDialogs/AddNewCustomerDialog/AddNewCustomerDialog";
import {AxiosError} from "axios";
import {useCustomers} from "../Provider/CustomerContext";
import {useAuth} from "../context/AuthContext";
import AddNewPackagingModal from "../dialogs/packagingModal/AddNewPackagingModal/AddNewPackagingModal";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {addSupplier} from "../../api/_supplier";
import {addProduct} from "../../api/_product";
import {addNewCategory} from "../../api/_categories";
import {addNewPackagingMaterial} from "../../api/_packagingMaterials";
import AddGiftBoxModal from "../dialogs/AddGiftBoxModal/AddGiftBoxModal";
import {useGiftSet} from "../Provider/GiftSetContext";
import {usePackaging} from "../Provider/PackagingContext";

//TODO Додати опцію Зберігти і додати ще

const AddButtonWithMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const {showSnackbarMessage} = useSnackbarMessage()
    const {createCustomerFunc} = useCustomers(); // Отримуємо функцію з контексту
    const {createNewGiftSet} = useGiftSet();
    const {fetchPackagingOptions} = usePackaging();


    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const [newProduct, setNewProduct] = useState<INewProduct>({
        available_quantity: 0, sold_quantity: 0, total_quantity: 0,
        name: '',
        supplier_id: '',
        purchase_total_price: 0.00,
        purchase_price_per_item: 0.00,
        category_ids: [],
        created_date: new Date().toISOString().slice(0, 10),
        selling_price_per_item: 0.00,
        selling_total_price: 0.00,
        selling_quantity: 0
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
            total_quantity: 0,
            available_quantity: 0,
            sold_quantity: 0,
            purchase_total_price: 0.00,
            purchase_price_per_item: 0.00,
            category_ids: [],
            created_date: new Date().toISOString().slice(0, 10),
            selling_total_price: 0.00,
            selling_price_per_item: 0.00,
            selling_quantity: 0
        });
        setSelectedCategories([])
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

    const handleCategoryChange = (categoryId: number[]) => {
        setSelectedCategories(categoryId);

        setNewProduct((prevProduct) => {
            return {
                ...prevProduct,
                category_ids: categoryId // Оновлення категорій
            };
        });
    };

    const handleRemoveCategory = (idToRemove: number) => {
        if (!newProduct) return;
        const updated = newProduct.category_ids.filter(id => id !== idToRemove);
        handleCategoryChange(updated);
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

    const handlePurchaseNewPackaging = (newPackagingData: IPurchasePackagingMaterial) => {

        addNewPackagingMaterial(newPackagingData).then(() => {
            handleModalClose("addNewPackage")
            showSnackbarMessage('Packaging Material added successfully!', 'success');
        }).catch((error: AxiosError) => {
            console.error('Error creating packaging material:', error);
            showSnackbarMessage('Error creating packaging material: ' + error.response?.data?.error || 'Unknown error', 'error');

        });
    };

    const handleAddNewGiftBox = async (handleAddNewGiftBox: IHandleAddNewGiftBox) => {
        if (!handleAddNewGiftBox.name.trim()) {
            showSnackbarMessage('The gift set must have a name.', 'warning'); // Show success message
            return;
        }

        if (handleAddNewGiftBox.selectedProducts.length === 0 && handleAddNewGiftBox.selectedPackaging.length === 0) {
            showSnackbarMessage('The gift set must contain at least one product or packaging.', 'warning'); // Show success message
            return;
        }

        const payload: GiftSetPayload = {
            name: handleAddNewGiftBox.name,
            description: handleAddNewGiftBox.description,
            gift_selling_price: handleAddNewGiftBox.price,
            items: [
                ...handleAddNewGiftBox.selectedProducts.map((item) => ({
                    item_id: item.item_id,
                    item_type: "product" as const,
                    quantity: item.quantity,
                })),
                ...handleAddNewGiftBox.selectedPackaging.map((item) => ({
                    item_id: item.item_id,
                    item_type: "packaging" as const,
                    quantity: item.quantity,
                })),
            ],
        };

        try {
            await createNewGiftSet(payload)
            handleModalClose("addNewGiftBox");

            fetchProductsFunc()
            fetchPackagingOptions();

        } catch (error: AxiosError) {
            console.error('Error creating gift box:', error);
            showSnackbarMessage('Error creating gift box: ' + error || 'Unknown error', 'error');
        }

        // createGiftBox(payload).then(() => {
        //     handleModalClose("addNewGiftBox");
        //     showSnackbarMessage('Gift box created successfully!', 'success'); // Show success message
        // }).catch((error: AxiosError) => {
        //     console.error('Error creating gift box:', error);
        //     showSnackbarMessage('Error creating gift box: ' + error || 'Unknown error', 'error');
        // });

    };


    return (
        <Box>
            <Tooltip title="Додати" placement="right">
               <span>
                   <IconButton size={"small"} color="primary" onClick={handleClick}>
                                   <AddCircleOutlineIcon/>
                               </IconButton>
               </span>
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
                <Box maxWidth={300} sx={{p: 2}}>
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
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth
                                    onClick={() => handleModalOpen("addNewPackage")}>
                                Пакування
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant={"contained"} color="primary" fullWidth
                                    onClick={() => handleModalOpen("addNewGiftBox")}>
                                Подарунковий набір
                            </Button>
                        </Grid>

                    </Grid>
                </Box>
            </Popover>
            {
                modalState.openAdd && <AddProductModal
                    isAuthenticated={isAuthenticated}
                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    openAdd={modalState.openAdd}
                    handleAdd={handleAddProduct}
                    handleRemoveCategory={handleRemoveCategory}
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
                isAuthenticated={isAuthenticated}
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleCloseAddSupplierModal={() => handleModalClose("openAddSupplierOpen")}
            />}

            {modalState.createCustomerDialog && <AddNewCustomerDialog
                isAuthenticated={isAuthenticated}
                setNewCustomerData={setNewCustomerData}
                newCustomerData={newCustomerData}
                openAddNewCustomerDialog={modalState.createCustomerDialog}
                handleCloseAddNewCustomerDialog={() => handleModalClose("createCustomerDialog")}
                handleAddCustomer={handleCreateCustomer}/>}

            {modalState.addNewPackage && <AddNewPackagingModal openAddNewPackaging={modalState.addNewPackage}
                                                               handleCloseAddNewPackaging={() => handleModalClose('addNewPackage')}
                                                               handlePurchaseNewPackaging={handlePurchaseNewPackaging}/>}

            {modalState.addNewGiftBox && <AddGiftBoxModal
                handleCloseGiftModal={() => handleModalClose('addNewGiftBox')}
                openGiftModal={modalState.addNewGiftBox}
                handleAddNewGiftBox={handleAddNewGiftBox}
            />}


        </Box>
    );
};

export default AddButtonWithMenu;
