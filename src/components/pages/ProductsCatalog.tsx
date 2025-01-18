import React, {useEffect, useRef, useState} from 'react';
import {useProducts} from "../Provider/ProductContext";
import {
    ICategory,
    IEditProduct,
    INewProduct, INewSupplier,
    IProduct,
    IPurchaseData, ISaleData, IStateFilters,
    ISupplier,
    modalNames,
    ModalNames
} from "../../utils/types";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import {formatDate} from "../../utils/function";
import {
    Badge,
    Box,
    Button,
    CircularProgress,
    Drawer, Grid,
    IconButton,
    Snackbar,
    Typography
} from "@mui/material";
import FilterComponent from "../filters/FilterComponent/FilterComponent";
import ResponsiveProductView from "../ResponsiveProductView/ResponsiveProductView";
import AddProductModal from "../dialogs/AddProductModal/AddProductModal";
import EditProductModal from "../dialogs/EditProductModal/EditProductModal";
import ProductHistoryModal from "../dialogs/ProductHistoryModal/ProductHistoryModal";
import PurchaseProductModal from "../dialogs/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "../dialogs/SaleProductModal/SaleProductModal";
import CreateNewCategoryModal from "../dialogs/CreateNewCategoryModal/CreateNewCategoryModal";
import ConfirmDeleteModal from "../dialogs/ConfirmDeleteModal/ConfirmDeleteModal";
import AddSupplierModal from "../dialogs/AddSupplierModal/AddSupplierModal";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import NotificationPanel from "../NotificationPanel/NotificationPanel";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from '@mui/icons-material/FilterList';
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {addSupplier, fetchGetAllSuppliers} from "../../api/_supplier";
import {addProduct, addPurchase, addSale, deleteProduct, updateProduct} from "../../api/_product";
import {logoutUser} from "../../api/_user";
import {addNewCategory, fetchGetAllCategories} from "../../api/_categories";
import {exportToExcel} from "../../api/api";

const ProductsCatalog = () => {

    const {products, loadingState, fetchProductsFunc} = useProducts();
    const [lowQuantityProducts, setLowQuantityProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const tableRowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
    const [selectedLowProductId, setSelectedLowProductId] = useState<number | null>(null);
    let navigate = useNavigate();


    const {isAuthenticated, logout} = useAuth();
    const {showSnackbarMessage} = useSnackbarMessage()


    const handleLogout = async () => {
        try {
            await logoutUser(); // Call the logout API function
            logout(); // Clear token from context and localStorage
            showSnackbarMessage('Ви розлогінилися', 'success')

            // Redirect to home page or login page (e.g., using React Router)
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const [newProduct, setNewProduct] = useState<INewProduct>({
        available_quantity: 1, sold_quantity: 0, total_quantity: 0,
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
    const [editProduct, setEditProduct] = useState<IEditProduct | null>(null);

    // Modal States
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );

    const [productId, setProductId] = useState<number | null>(null);
    const [purchaseDetails, setPurchaseDetails] = useState<IPurchaseData>({
        quantity: 1,
        purchase_price_per_item: 0,
        purchase_total_price: 0,
        supplier_id: '',
        purchase_date: new Date().toISOString().slice(0, 10)
    });
    const [saleData, setSaleData] = useState<ISaleData | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const [selectedDeleteModalProductId, setSelectedDeleteModalProductId] = useState<number | null>(null);

    const [order, setOrder] = useState<'asc' | 'desc'>('asc'); // Порядок сортування (asc/desc)
    const [orderBy, setOrderBy] = useState<keyof IProduct>('name'); // Колонка для сортування
    const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' | 'info' | 'warning' | undefined }>({
        message: '',
        severity: undefined,
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Додайте цей рядок
    const [filteredAndSearchedProducts, setFilteredAndSearchedProducts] = useState<IProduct[]>([])

    // Стейт для фільтрів
    const [filters, setFilters] = useState<IStateFilters>({
        categories: [] as number[],
        suppliers: [] as number[],
        priceRange: [0, 1000] as [number, number],
    });


    // Load products and suppliers
    useEffect(() => {
        fetchSuppliersFunc();
        fetchCategoriesFunc();
    }, []);

    useEffect(() => {
        setFilteredProducts(products)
    }, [products])


    const fetchSuppliersFunc = async () => {
        try {
            const data = await fetchGetAllSuppliers(); // Assuming fetchGetAllSuppliers() returns a Promise
            if (Array.isArray(data)) {
                setSuppliers(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching suppliers', error);
        }
    };

    const fetchCategoriesFunc = async () => {
        try {
            const data = await fetchGetAllCategories(); // Assuming fetchGetAllCategories() returns a Promise
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: true}));
    };


    const resetNewProduct = () => {
        setNewProduct({
            available_quantity: 1, sold_quantity: 0, total_quantity: 0,
            name: '',
            supplier_id: '',
            purchase_total_price: 0.00,
            purchase_price_per_item: 0.00,
            category_ids: [],
            created_date: new Date().toISOString().slice(0, 10),
            selling_total_price: 0.00,
            selling_price_per_item: 0.00,
            selling_quantity: 0

        });
    };

    const resetPurchaseDetails = () => {
        setEditProduct(null)
        setPurchaseDetails({
            quantity: 1,
            purchase_price_per_item: 0,
            purchase_total_price: 0,
            supplier_id: '',
            purchase_date: new Date().toISOString().slice(0, 10)
        });
    };

    const resetEditProduct = () => {
        setEditProduct(null);
        setSelectedCategories([]);
    };

    const resetSaleData = () => {
        setEditProduct(null)
        setSaleData(null);
    };

    const resetStatesMap = {
        openAdd: resetNewProduct,
        openPurchase: resetPurchaseDetails,
        openEdit: resetEditProduct,
        openSale: resetSaleData,
    };

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
        resetStatesMap[modal]?.(); // Виклик відповідної функції скидання
    };

    const handleDeleteModalOpen = (productId: number) => {
        setSelectedDeleteModalProductId(productId);
        handleModalOpen('openDelete');
    };

    const handleCloseDeleteModal = () => {
        handleModalClose('openDelete');

        setSelectedDeleteModalProductId(null);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbar({message, severity});
        setOpenSnackbar(true);
    };


    const handleDelete = async (productId: number) => {
        try {
            await deleteProduct(productId);
            handleCloseDeleteModal();
            await fetchProductsFunc();
            showSnackbarMessage('Product deleted successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error deleting the product!', error);
            showSnackbarMessage('Failed to delete the product!', 'error'); // Show error message
        }
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

    const handleEditSave = async () => {
        if (!editProduct) return;
        try {
            await updateProduct(editProduct.id, editProduct);
            handleModalClose('openEdit');
            await fetchProductsFunc();
            showSnackbarMessage('Product updated successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error updating the product!', error);
            showSnackbarMessage('Failed to update the product!', 'error'); // Show error message
        }
    };
    const handlePurchase = (product: IProduct) => {
        setEditProduct(null);
        setEditProduct(mapProductToEditProduct(product));
        setPurchaseDetails(prevDetails => ({
            ...prevDetails,
            supplier_id: product.supplier ? product.supplier.id : '',
            purchase_price_per_item: product.purchase_price_per_item,
            purchase_total_price: product.purchase_price_per_item
        }));
        handleModalOpen('openPurchase');
    };

    const handleSubmitPurchase = async () => {
        if (!editProduct) return;
        const purchaseData: IPurchaseData = {
            quantity: purchaseDetails.quantity,
            purchase_price_per_item: purchaseDetails.purchase_price_per_item,
            purchase_total_price: purchaseDetails.purchase_total_price,
            supplier_id: purchaseDetails.supplier_id,
            purchase_date: purchaseDetails.purchase_date,
        };

        try {
            await addPurchase(editProduct.id, purchaseData);
            handleModalClose('openPurchase');
            await fetchProductsFunc();
            showSnackbar('Purchase submitted successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error processing the purchase!', error);
            showSnackbar('Failed to process the purchase!', 'error'); // Show error message
        }
    };

    const handleSale = async () => {
        if (saleData) {
            try {
                await addSale(saleData.productId, saleData);
                handleModalClose('openSale');
                showSnackbarMessage('Sale completed successfully!', 'success'); // Show success message
                await fetchProductsFunc();
            } catch (error) {
                console.error('There was an error saving the sale!', error);
                showSnackbarMessage('Failed to save the sale!', 'error'); // Show error message
            }
        }
    };

    const handleAddSupplier = (newSupplier: INewSupplier) => {

        addSupplier(newSupplier)
            .then(() => {
                handleModalClose("openAddSupplierOpen");
                showSnackbar('Supplier completed successfully!', 'success'); // Show success message
                fetchSuppliersFunc(); // Оновити список постачальників після додавання
            })
            .catch((error) => {
                console.error('There was an error saving the supplier!', error);
                showSnackbar('There was an error saving the supplier!', "error");
            });
    };

    const handleOpenEdit = (product: IProduct) => {
        setEditProduct(null);
        setEditProduct(mapProductToEditProduct(product));
        setSelectedCategories(product.category_ids);
        handleModalOpen('openEdit');
    };


    const mapProductToEditProduct = (product: IProduct): IEditProduct => ({
        id: product.id,
        name: product.name,
        supplier_id: product.supplier ? product.supplier.id : '',
        available_quantity: product.available_quantity,
        sold_quantity: product.sold_quantity,
        total_quantity: product.total_quantity,
        purchase_total_price: product.purchase_total_price,
        purchase_price_per_item: product.purchase_price_per_item,
        category_ids: product.category_ids,
        created_date: formatDate(product.created_date),
        selling_price_per_item: product.selling_price_per_item,
        selling_total_price: product.selling_total_price,
        selling_quantity: product.selling_quantity,
    });


    const handleSort = (property: keyof IProduct) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortProducts = (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => {
        const stabilizedProducts = products.map((el, index) => [el, index] as [IProduct, number]);
        stabilizedProducts.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];  // This is fine because index is a number
        });
        return stabilizedProducts.map((el) => el[0]);
    };

    const getFieldValue = (product: IProduct, field: keyof IProduct): any => {
        if (field === 'supplier') {
            return product.supplier?.name || ''; // Повертає ім'я постачальника або порожній рядок
        }
        return product[field];
    };

    const getComparator = (order: 'asc' | 'desc', orderBy: keyof IProduct) => {
        return order === 'desc'
            ? (a: IProduct, b: IProduct) => (getFieldValue(b, orderBy) < getFieldValue(a, orderBy) ? -1 : 1)
            : (a: IProduct, b: IProduct) => (getFieldValue(a, orderBy) < getFieldValue(b, orderBy) ? -1 : 1);
    };

    const handleOpenSale = (product: IProduct) => {
        setEditProduct({
            available_quantity: product.available_quantity,
            sold_quantity: product.sold_quantity,
            total_quantity: product.total_quantity,
            id: product.id,
            name: product.name,
            supplier_id: product.supplier ? product.supplier.id : '',
            purchase_total_price: product.purchase_total_price,
            purchase_price_per_item: product.purchase_price_per_item,
            category_ids: product.category_ids,
            created_date: formatDate(product.created_date),
            selling_price_per_item: product.selling_price_per_item,
            selling_total_price: product.selling_total_price,
            selling_quantity: product.selling_quantity
        })

        setSaleData({
            packaging_id: '',
            packaging_quantity: 0,
            total_cost_price: 0,
            customer: '',
            quantity: 1,
            selling_price_per_item: product.selling_price_per_item,
            selling_total_price: product.selling_total_price,
            purchase_price_per_item: product.purchase_price_per_item,
            sale_date: new Date().toISOString().split('T')[0],
            productId: product.id,
            total_packaging_cost: 0 // Зберігаємо ID продукту для відправки на сервер
        });
        handleModalOpen("openSale")
    };

    const handleOpenHistoryModal = (product_id: number) => {
        setProductId(product_id); // Встановлюємо productId
        handleModalOpen("openHistory")
    }

    const handleCategoryChange = (categoryId: number[]) => {

        setSelectedCategories(categoryId)


        setNewProduct((prevProduct) => {

            return {
                ...prevProduct,
                category_ids: categoryId // Оновлення категорій
            };
        });
    };


    const createNewCategory = (categoryName: string) => {
        addNewCategory(categoryName).then(() => {
            fetchGetAllCategories().then(data => {

                if (Array.isArray(data)) {
                    setCategories(data as ICategory[]);
                } else {
                    console.error('Fetched data is not an array:', data);
                    setCategories([])
                }

            })

            handleModalClose("openCategoryCreate"); // Закрити модальне вікно після додавання
        })
            .catch(error => {
                console.error('There was an error adding the product!', error);
            });
    };

    // Use this effect to set low quantity products when data changes
    useEffect(() => {
        const lowQuantity = products.filter(product => product.available_quantity < 5);
        setLowQuantityProducts(lowQuantity);
        lowQuantity.length > 0 ? handleModalOpen("snackbarNotifyOpen") : handleModalClose("snackbarNotifyOpen")
    }, [products]);

    const resetFilters = () => {
        setFilters({
            categories: [],
            suppliers: [],
            priceRange: [0, Math.max(...products.map(product => product.selling_price_per_item)) || 1000]
        })
        // Скидаємо діапазон цін
    }

    useEffect(() => {
        if (filteredProducts.length > 0) {
            const array = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAndSearchedProducts(array)
        } else {
            setFilteredAndSearchedProducts([])
        }

    }, [filteredProducts, searchTerm]);

    // const filteredAndSearchedProducts = filteredProducts.filter(product =>
    //     product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleListItemClick = (productId: number) => {
        console.log("Натиснули на товар з ID:", productId);

        // Спочатку скидаємо фільтри
        // resetFiltersAndOrderAndSearch();
        resetFilters()
        setSelectedLowProductId(productId);  // Встановлюємо ID обраного продукту

        setSearchTerm(''); // Скидання пошуку
        console.log("Фільтри скинуті");

        // Знайти рядок таблиці за ID продукту
        console.log(filteredAndSearchedProducts);
        const sortedProducts = sortProducts(filteredAndSearchedProducts, getComparator(order, orderBy));
        const rowIndex = sortedProducts.findIndex(product => product.id === productId);
        console.log("Знайдений індекс продукту:", rowIndex);

        if (rowIndex !== -1) {
            // Обчислити, на якій сторінці знаходиться цей продукт
            const targetPage = Math.floor(rowIndex / itemsPerPage);
            console.log("Продукт знаходиться на сторінці:", targetPage);

            // Змінюємо сторінку
            setCurrentPage(targetPage);

            // Використати setTimeout для прокрутки, щоб дати час на оновлення сторінки
            setTimeout(() => {
                const rowElement = tableRowRefs.current[rowIndex];
                console.log("Елемент рядка таблиці:", rowElement);

                if (rowElement) {
                    handleModalClose("openNotificationDrawer")
                    console.log("Прокрутка до елемента:", rowElement);
                    rowElement.scrollIntoView({behavior: 'smooth', block: 'center'});
                } else {
                    console.log("Елемент не знайдено для індексу:", rowIndex);
                }
            }, 100);

            setTimeout(() => {
                setSelectedLowProductId(null)
            }, 3000)
        } else {
            console.log("Продукт з ID", productId, "не знайдений");
        }
    };

    const handleExportToExcel = () => {
        const productIds = filteredAndSearchedProducts.map(product => product.id);
        exportToExcel(productIds);
    };


// Обробник для зміни слайдера
    return (
        <React.Fragment>


            {loadingState.isLoading ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                     height="100vh">
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <CircularProgress/> {/* Прелоадер */}
                        <Typography variant="h6" sx={{mt: 2}}>
                            Loading...
                        </Typography>
                    </Box>
                </Box>
            ) : loadingState.error ? (
                <div>{loadingState.error}</div> // Відображення помилки
            ) : (
                <Box sx={{paddingTop: 1}}>
                    <h1>Список товарів</h1>
                    <Grid container justifyContent={"space-between"}>
                        <Grid item>
                            <Button
                                startIcon={<FilterListIcon/>}
                                variant={"contained"}
                                onClick={() => handleModalOpen("openDrawer")}>Фільтр</Button>
                        </Grid>
                        <Grid item>
                            <Button variant={"contained"} onClick={handleExportToExcel}>Експортувати в Excel</Button>
                        </Grid>
                    </Grid>
                    <Drawer classes={{
                        paper: "filter_container"
                    }} open={modalState.openDrawer} onClose={() => handleModalClose("openDrawer")}>
                        <Button variant={"outlined"} onClick={() => handleModalClose("openDrawer")}>
                            Закрити
                        </Button>
                        <FilterComponent
                            products={products}
                            setFilteredProducts={setFilteredProducts}
                            filters={filters}
                            setFilters={setFilters}
                            filterArrayLength={filteredProducts.length}
                            categories={categories}
                            suppliers={suppliers}
                            resetFilters={resetFilters}/>
                    </Drawer>

                    <ResponsiveProductView
                        selectedLowProductId={selectedLowProductId}
                        filteredAndSearchedProducts={filteredAndSearchedProducts}
                        ref={(el, index) => {
                            tableRowRefs.current[index] = el;
                        }}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        setCurrentPage={setCurrentPage}
                        setItemsPerPage={setItemsPerPage}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredProducts={filteredProducts}
                        order={order}
                        orderBy={orderBy}
                        handleSort={handleSort}
                        sortProducts={sortProducts}
                        getComparator={getComparator}
                        handleOpenEdit={handleOpenEdit}
                        handleDelete={handleDeleteModalOpen}
                        handlePurchase={(product) => {
                            console.log('Purchase product:', product);
                            handlePurchase(product);
                        }}
                        handleOpenSale={(product) => {
                            console.log('Open sale for product:', product);
                            handleOpenSale(product);
                        }}
                        handleOpenHistoryModal={handleOpenHistoryModal}
                    />

                    {/* Кнопка для відкриття модального вікна для додавання */}


                </Box>
            )}


            {
                modalState.openAdd && <AddProductModal
                    suppliers={suppliers}
                    setNewProduct={setNewProduct}
                    newProduct={newProduct}
                    openAdd={modalState.openAdd}
                    categories={categories}
                    handleAdd={handleAddProduct}
                    handleCategoryChange={handleCategoryChange}
                    handleCloseAdd={() => handleModalClose("openAdd")}
                    selectedCategories={selectedCategories}/>
            }

            {(modalState.openEdit && editProduct && !loadingState.isLoading) &&
            <EditProductModal suppliers={suppliers}
                              selectedCategories={selectedCategories} categories={categories}
                              openEdit={modalState.openEdit}
                              handleCloseEdit={() => handleModalClose("openEdit")}
                              editProduct={editProduct}
                              setEditProduct={setEditProduct} handleEditSave={handleEditSave}/>}


            {(modalState.openHistory && productId) && (
                <ProductHistoryModal
                    productName={products.find(product => product.id === productId).name}
                    openHistory={modalState.openHistory}
                    onClose={() => handleModalClose("openHistory")}
                    productId={productId} // Передаємо productId
                />
            )}

            {(modalState.openPurchase && purchaseDetails && editProduct?.name) &&
            <PurchaseProductModal
                nameProduct={editProduct.name} openPurchase={modalState.openPurchase}
                suppliers={suppliers}
                handleClosePurchase={() => handleModalClose("openPurchase")}
                purchaseDetails={purchaseDetails}
                setPurchaseDetails={setPurchaseDetails}
                handleSubmitPurchase={handleSubmitPurchase}/>}


            {
                (modalState.openSale && saleData && editProduct) &&
                <SaleProductModal
                    nameProduct={editProduct.name}
                    purchasePricePerItem={editProduct.purchase_price_per_item}
                    quantityOnStock={editProduct.available_quantity}
                    openSale={modalState.openSale}
                    handleCloseSale={() => handleModalClose("openSale")}
                    saleData={saleData}
                    setSaleData={setSaleData}
                    handleSale={handleSale}
                />
            }

            {
                modalState.openCategoryCreate &&
                <CreateNewCategoryModal
                    createNewCategory={createNewCategory}
                    openCategoryCreateModal={modalState.openCategoryCreate}
                    handleCloseCategoryModal={() => handleModalClose("openCategoryCreate")}
                />
            }

            <ConfirmDeleteModal openConfirmDeleteModal={modalState.openDelete}
                                handleCloseDeleteModal={handleCloseDeleteModal}
                                selectedDeleteModalProductId={selectedDeleteModalProductId}
                                handleDelete={handleDelete}/>

            <AddSupplierModal
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleClose={() => handleModalClose("openAddSupplierOpen")}
            />

            <div style={{position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: "10px"}}>
                {lowQuantityProducts.length > 0 && (
                    <IconButton
                        onClick={() => handleModalOpen("openNotificationDrawer")}
                        title={`Low quantity products: ${lowQuantityProducts.length}`} // Tooltip for low quantity products
                    >
                        <Badge badgeContent={lowQuantityProducts.length} color="error">
                            <NotificationImportantIcon/>
                        </Badge>
                    </IconButton>
                )}
                {isAuthenticated ? (
                    <Button variant={"text"} onClick={handleLogout} title="Logout" endIcon={<ExitToAppIcon/>}>
                        Вийти
                    </Button>
                ) : (
                    <Button
                        variant={"text"}
                        onClick={() => navigate('/crm_front_react/login')}
                        title="Login"
                        endIcon={<LoginIcon/>}
                    >
                        Увійти
                    </Button>
                )}
            </div>


            {/* Drawer Component */}
            <Drawer anchor="right" open={modalState.openNotificationDrawer}

                    onClose={() => handleModalClose("openNotificationDrawer")}>
                <Button variant={"outlined"} onClick={() => handleModalClose("openNotificationDrawer")}>
                    Закрити
                </Button>
                <NotificationPanel handleListItemClick={handleListItemClick} lowQuantityProducts={lowQuantityProducts}/>
            </Drawer>


            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                sx={{marginTop: 4}}
                open={modalState.snackbarNotifyOpen}
                autoHideDuration={1000}
                onClose={() => handleModalClose("snackbarNotifyOpen")}
                message={`${lowQuantityProducts.length} товарів з низькою кількістю`}
                action={
                    <IconButton size="small" aria-label="close" color="inherit"
                                onClick={() => handleModalClose("snackbarNotifyOpen")}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                }
            />

        </React.Fragment>

    );
};

export default ProductsCatalog;
