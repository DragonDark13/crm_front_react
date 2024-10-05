import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Box,
    DialogContent,
    DialogTitle,
    Dialog,
    DialogContentText,
    DialogActions,
    Drawer,
    Grid,
    Container,
    Alert,
    Snackbar, IconButton, Badge
} from '@mui/material';


import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CloseIcon from '@mui/icons-material/Close';

import ProductHistoryModal from "./components/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO add handle error


import './App.css'
import {
    addNewCategory,
    addProduct,
    addPurchase,
    addSale, addSupplier,
    deleteProduct,
    fetchGetAllCategories, fetchGetAllSuppliers,
    fetchProducts,
    updateProduct
} from "./api/api";
import AddProductModal from "./components/AddProductModal/AddProductModal";
import EditProductModal from "./components/EditProductModal/EditProductModal";
import PurchaseProductModal from "./components/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "./components/SaleProductModal/SaleProductModal";
import CreateNewCategoryModal from "./components/CreateNewCategoryModal/CreateNewCategoryModal";
import AddSupplierModal from "./components/AddSupplierModal/AddSupplierModal";
import FilterComponent from "./components/FilterComponent/FilterComponent";
import {
    ICategory,
    IEditProduct,
    INewProduct,
    INewSupplier,
    IProduct,
    IPurchaseData,
    ISaleData,
    ISupplier, modalNames, ModalNames
} from "./utils/types";
import ResponsiveProductView from "./components/ResponsiveProductView/ResponsiveProductView";
import NotificationPanel from "./components/NotificationPanel/NotificationPanel";
import {formatDate} from "./utils/function";


function App() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [lowQuantityProducts, setLowQuantityProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const tableRowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
    const [selectedLowProductId, setSelectedLowProductId] = useState<number | null>(null);


    const [loadingState, setLoadingState] = useState<{ isLoading: boolean, error: null | string }>({
        isLoading: true,
        error: null
    });
    const [newProduct, setNewProduct] = useState<INewProduct>({
        name: '',
        supplier_id: '',
        quantity: 1,
        total_price: 0,
        price_per_item: 0,
        category_ids: [],
        created_date: new Date().toISOString().slice(0, 10),
    });
    const [editProduct, setEditProduct] = useState<IEditProduct | null>(null);

    // Modal States
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );

    const [productId, setProductId] = useState<number | null>(null);
    const [purchaseDetails, setPurchaseDetails] = useState<IPurchaseData>({
        quantity: 1,
        price_per_item: 0,
        total_price: 0,
        supplier_id: '',
        purchase_date: new Date().toISOString().slice(0, 10)
    });
    const [saleData, setSaleData] = useState<ISaleData | null>(null);

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<number[]>([]);
    const [selectedFilterSuppliers, setSelectedFilterSuppliers] = useState<number[]>([]);
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


    // Load products and suppliers
    useEffect(() => {
        fetchProductsFunc();
        fetchSuppliersFunc();
        fetchCategoriesFunc();
    }, []);

    const fetchProductsFunc = async () => {
        try {
            setLoadingState({isLoading: true, error: null});
            const data = await fetchProducts(); // Assuming fetchProducts() returns a Promise
            if (Array.isArray(data)) {
                setProducts(data);
                setFilteredProducts(data);
            } else {
                throw new Error('Fetched data is not an array');
            }
        } catch (error) {
            console.error('There was an error fetching the products!', error);
            setLoadingState({isLoading: false, error: 'There was an error fetching the products!'});
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoadingState(prev => ({...prev, isLoading: false}));
        }
    };

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

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
        // Reset states based on modal closed
        if (modal === 'openAdd') {
            resetNewProduct();
        } else if (modal === 'openPurchase') {
            resetPurchaseDetails();
        } else if (modal === 'openEdit') {
            resetEditProduct();
        } else if (modal === 'openSale') {
            resetSaleData();
        }
    };

    const resetNewProduct = () => {
        setNewProduct({
            name: '',
            supplier_id: '',
            quantity: 1,
            total_price: 0,
            price_per_item: 0,
            category_ids: [],
            created_date: new Date().toISOString().slice(0, 10)
        });
    };

    const resetPurchaseDetails = () => {
        setPurchaseDetails({
            quantity: 1,
            price_per_item: 0,
            total_price: 0,
            supplier_id: '',
            purchase_date: new Date().toISOString().slice(0, 10)
        });
    };

    const resetEditProduct = () => {
        setEditProduct(null);
        setSelectedCategories([]);
    };

    const resetSaleData = () => {
        setSaleData(null);
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

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };


    const handleDelete = async (productId: number) => {
        try {
            await deleteProduct(productId);
            handleCloseDeleteModal();
            await fetchProductsFunc();
            showSnackbar('Product deleted successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error deleting the product!', error);
            showSnackbar('Failed to delete the product!', 'error'); // Show error message
        }
    };

    const handleAddProduct = async () => {
        try {
            await addProduct(newProduct);
            await fetchProductsFunc();
            handleModalClose('openAdd');
            showSnackbar('Product added successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error adding the product!', error);
            showSnackbar('Failed to add the product!', 'error'); // Show error message
        }
    };

    const handleEditSave = async () => {
        if (!editProduct) return;
        try {
            await updateProduct(editProduct.id, editProduct);
            handleModalClose('openEdit');
            await fetchProductsFunc();
            showSnackbar('Product updated successfully!', 'success'); // Show success message
        } catch (error) {
            console.error('There was an error updating the product!', error);
            showSnackbar('Failed to update the product!', 'error'); // Show error message
        }
    };
    const handlePurchase = (product: IProduct) => {
        setEditProduct(mapProductToEditProduct(product));
        setPurchaseDetails(prevDetails => ({
            ...prevDetails,
            supplier_id: product.supplier ? product.supplier.id : '',
            price_per_item: product.price_per_item,
            total_price: product.price_per_item
        }));
        handleModalOpen('openPurchase');
    };

    const handleSubmitPurchase = async () => {
        if (!editProduct) return;
        const purchaseData: IPurchaseData = {
            quantity: purchaseDetails.quantity,
            price_per_item: purchaseDetails.price_per_item,
            total_price: purchaseDetails.total_price,
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
                await fetchProductsFunc();
                showSnackbar('Sale completed successfully!', 'success'); // Show success message
            } catch (error) {
                console.error('There was an error saving the sale!', error);
                showSnackbar('Failed to save the sale!', 'error'); // Show error message
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
        setEditProduct(mapProductToEditProduct(product));
        setSelectedCategories(product.category_ids);
        handleModalOpen('openEdit');
    };

    const handleOpenAdd = () => {
        handleModalOpen("openAdd");
        setNewProduct((newProduct) => {
            return {
                ...newProduct,
            }
        })
    };

    const mapProductToEditProduct = (product: IProduct): IEditProduct => ({
        id: product.id,
        name: product.name,
        supplier_id: product.supplier ? product.supplier.id : '',
        quantity: product.quantity,
        total_price: product.total_price,
        price_per_item: product.price_per_item,
        category_ids: product.category_ids,
        created_date: formatDate(product.created_date),
    });

    const applyFilters = (updatedCategories: number[], updatedSuppliers: number[], callback?) => {
        let filtered = products;

        // Filter by categories
        if (updatedCategories.length > 0) {
            filtered = filtered.filter(product =>
                product.category_ids.some(categoryId => updatedCategories.includes(categoryId))
            );
        }

        // Filter by suppliers
        if (updatedSuppliers.length > 0) {
            filtered = filtered.filter(product => product.supplier && updatedSuppliers.includes(product.supplier.id));
        }
        console.log(filtered);
        setFilteredProducts(filtered);
        if (callback) callback();
    };

    const handleCategoryFilterChange = (categoryID: number) => {
        const updatedCategories = toggleFilter(selectedFilterCategories, categoryID);
        setSelectedFilterCategories(updatedCategories);
        applyFilters(updatedCategories, selectedFilterSuppliers);
    };

    const handleSupplierFilterChange = (supplierID: number) => {
        const updatedSuppliers = toggleFilter(selectedFilterSuppliers, supplierID);
        setSelectedFilterSuppliers(updatedSuppliers);
        applyFilters(selectedFilterCategories, updatedSuppliers);
    };

    const toggleFilter = (currentFilters: number[], id: number) => {
        return currentFilters.includes(id)
            ? currentFilters.filter(filterId => filterId !== id)
            : [...currentFilters, id];
    };

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
            id: product.id,
            name: product.name,
            supplier_id: product.supplier ? product.supplier.id : '',
            quantity: product.quantity,
            total_price: product.total_price,
            price_per_item: product.price_per_item,
            category_ids: product.category_ids,
            created_date: formatDate(product.created_date)
        })

        setSaleData({
            customer: '',
            quantity: 1,
            price_per_item: product.price_per_item,
            total_price: product.price_per_item,
            sale_date: new Date().toISOString().split('T')[0],
            productId: product.id, // Зберігаємо ID продукту для відправки на сервер
        });
        handleModalOpen("openSale")
    };

    const handleOpenHistoryModal = (product_id: number) => {
        setProductId(product_id); // Встановлюємо productId
        handleModalOpen("openHistory")
    }

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
        const lowQuantity = products.filter(product => product.quantity < 5);
        setLowQuantityProducts(lowQuantity);
        lowQuantity.length > 0 ? handleModalOpen("snackbarNotifyOpen") : handleModalClose("snackbarNotifyOpen")
    }, [products]);

    const resetFiltersAndOrderAndSearch = () => {
        // Скидання фільтрів
        setOrderBy('name'); // Скидання сортування за ім'ям
        setOrder('asc'); // Скидання сортування
        setSearchTerm(''); // Скидання пошуку
        setSelectedFilterCategories([]);
        setSelectedFilterSuppliers([]);
        applyFilters([], []);
    };

    const resetFilters = () => {
        setSelectedFilterCategories([]);
        setSelectedFilterSuppliers([]);
        applyFilters([], []);
    }

    useEffect(() => {
        if (filteredProducts.length > 0) {
            const array = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAndSearchedProducts(array)
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
                <React.Fragment>
                    <Container maxWidth={"xl"}>
                        <h1>Список товарів</h1>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Button variant={"contained"}
                                        onClick={() => handleModalOpen("openDrawer")}>Фільтр</Button>
                            </Grid>
                            <Grid item>
                                <Grid container gap={1}>
                                    <Grid>
                                        <Button variant={"outlined"}
                                                color={"primary"}
                                                onClick={handleOpenAdd}>
                                            Створити Товар
                                        </Button>
                                    </Grid>
                                    <Grid>
                                        <Button variant={"outlined"} color={"primary"}
                                                onClick={() => handleModalOpen("openCategoryCreate")}
                                        >
                                            Створити Категорію
                                        </Button>
                                    </Grid>
                                    <Grid>

                                        <Button variant={"outlined"} color={"primary"}
                                                onClick={() => handleModalOpen("openAddSupplierOpen")}>
                                            Створити Постачальника
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Drawer open={modalState.openDrawer} onClose={() => handleModalClose("openDrawer")}>
                            <Button variant={"outlined"} onClick={() => handleModalClose("openDrawer")}>
                                Закрити
                            </Button>
                            <FilterComponent
                                selectedFilterCategories={selectedFilterCategories}
                                handleCategoryFilterChange={handleCategoryFilterChange}
                                categories={categories}
                                selectedFilterSuppliers={selectedFilterSuppliers}
                                handleSupplierFilterChange={handleSupplierFilterChange}
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


                    </Container></React.Fragment>
            )}


            {/* Модальне вікно для додавання нового товару */}

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

            {(modalState.openEdit && editProduct) &&
            <EditProductModal suppliers={suppliers}
                              selectedCategories={selectedCategories} categories={categories}
                              handleCategoryChange={handleCategoryChange} openEdit={modalState.openEdit}
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

            {(modalState.openPurchase && purchaseDetails && editProduct?.name) && <PurchaseProductModal
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

            <Dialog open={modalState.openDelete} onClose={handleCloseDeleteModal}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => {
                        selectedDeleteModalProductId && handleDelete(selectedDeleteModalProductId!)
                    }} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <AddSupplierModal
                handleAddSupplier={handleAddSupplier}
                open={modalState.openAddSupplierOpen}
                handleClose={() => handleModalClose("openAddSupplierOpen")}
            />

            <Snackbar
                open={openSnackbar}
                autoHideDuration={1000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {lowQuantityProducts.length > 0 && (
                <IconButton onClick={() => handleModalOpen("openNotificationDrawer")}
                            style={{position: "absolute", top: 16, right: 16}}>
                    <Badge badgeContent={lowQuantityProducts.length} color="error">
                        <NotificationImportantIcon/>
                    </Badge>
                </IconButton>
            )}


            {/* Drawer Component */}
            <Drawer anchor="right" open={modalState.openNotificationDrawer}
                    onClose={() => handleModalClose("openNotificationDrawer")}>
                <NotificationPanel handleListItemClick={handleListItemClick} lowQuantityProducts={lowQuantityProducts}/>
            </Drawer>


            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
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
}

export default App;
