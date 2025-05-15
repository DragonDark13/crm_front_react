import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Box,
    Drawer,
    Grid,
    Container,
    Alert,
    Snackbar, IconButton, Badge, CssBaseline
} from '@mui/material';


import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CloseIcon from '@mui/icons-material/Close';

import ProductHistoryModal from "./components/dialogs/productsDialogs/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO add handle error
//TODO сторінкі Товари Продажі Упаковки


import './scss/main.scss';

import Dashboard from "./components/Dachboard/Dashboard";
import ProductsCatalog from "./components/pages/ProductsCatalog";
import ClientsManagement from "./components/pages/ClientsManagement";
import Purchases from "./components/pages/PurchasesPage/Purchases";
import {BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import {Sidebar} from "./components/Dachboard/Sidebar";
import SpeedDial from "./components/SpeedDial/SpeedDial";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./components/Login/Login";
import PackagingMaterialList from "./components/pages/PackagingMaterialList";
import InvestmentsPage from "./components/pages/InvestmentsPage";
import SupplierPage from "./components/pages/SupplierPage";
import Sales from "./components/pages/Sales/Sales";
import GiftSetsPage from "./components/pages/GiftSetsPage/GiftSetsPage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";
import {useAuth} from "./components/context/AuthContext";
import {useProducts} from "./components/Provider/ProductContext";
import {IProduct, IStateFilters, modalNames, ModalNames} from "./utils/types";
import {logoutUser} from "./api/_user";
import {useSnackbarMessage} from "./components/Provider/SnackbarMessageContext";
import NotificationPanel from "./components/NotificationPanel/NotificationPanel";
import ResponsiveProductView from "./components/ResponsiveProductView/ResponsiveProductView";


function App() {

    const tableRowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

    const {products, loadingState} = useProducts();

    const {isAuthenticated, logout} = useAuth();
    const {showSnackbarMessage} = useSnackbarMessage()
    const [lowQuantityProducts, setLowQuantityProducts] = useState<IProduct[]>([]);
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(
        Object.fromEntries(modalNames.map(modal => [modal, false])) as Record<ModalNames, boolean>
    );
    const [order, setOrder] = useState<'asc' | 'desc'>('asc'); // Порядок сортування (asc/desc)
    const [itemsPerPage, setItemsPerPage] = useState(10); // Додайте цей рядок
    const [currentPage, setCurrentPage] = useState(0);


    const sortProducts = (products: IProduct[], comparator: (a: IProduct, b: IProduct) => number) => {
        const stabilizedProducts = products.map((el, index) => [el, index] as [IProduct, number]);
        stabilizedProducts.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];  // This is fine because index is a number
        });
        return stabilizedProducts.map((el) => el[0]);
    };


    const [filters, setFilters] = useState<IStateFilters>({
        categories: [] as number[],
        suppliers: [] as number[],
        priceRange: [0, 1000] as [number, number],
    });
    const [searchTerm, setSearchTerm] = useState('');

    const [orderBy, setOrderBy] = useState<keyof IProduct>('name'); // Колонка для сортування

    const [selectedLowProductId, setSelectedLowProductId] = useState<number | null>(null);

    const [filteredAndSearchedProducts, setFilteredAndSearchedProducts] = useState<IProduct[]>([])

    const getComparator = (order: 'asc' | 'desc', orderBy: keyof IProduct) => {
        return order === 'desc'
            ? (a: IProduct, b: IProduct) => (getFieldValue(b, orderBy) < getFieldValue(a, orderBy) ? -1 : 1)
            : (a: IProduct, b: IProduct) => (getFieldValue(a, orderBy) < getFieldValue(b, orderBy) ? -1 : 1);
    };
    const getFieldValue = (product: IProduct, field: keyof IProduct): any => {
        if (field === 'supplier') {
            return product.supplier?.name || ''; // Повертає ім'я постачальника або порожній рядок
        }
        return product[field];
    };

    const handleModalOpen = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: true}));
    };

    const resetStatesMap = {};

    const handleModalClose = (modal: ModalNames) => {
        setModalState(prevState => ({...prevState, [modal]: false}));
        resetStatesMap[modal]?.(); // Виклик відповідної функції скидання
    };

    const resetFilters = () => {
        setFilters({
            categories: [],
            suppliers: [],
            priceRange: [0, Math.max(...products.map(product => product.selling_price_per_item)) || 1000]
        })
        // Скидаємо діапазон цін
    }


    const handleListItemClick = (productId: number) => {
        console.log("Натиснули на товар з ID:", productId);

        // Спочатку скидаємо фільтри
        // resetFiltersAndOrderAndSearch();
        resetFilters()
        setSelectedLowProductId(productId);  // Встановлюємо ID обраного продукту

        setSearchTerm(''); // Скидання пошуку
        console.log("Фільтри скинуті");

        // Знайти рядок таблиці за ID продукту
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


    useEffect(() => {
        const lowQuantity = products.filter(product => product.available_quantity < 5);
        setLowQuantityProducts(lowQuantity);
        lowQuantity.length > 0 ? handleModalOpen("snackbarNotifyOpen") : handleModalClose("snackbarNotifyOpen")
    }, [products]);

    const handleLogout = async () => {

        logout(); // Clear token from context and localStorage

    };

    let navigate = useNavigate();


    return (
        <React.Fragment>
            <CssBaseline/>
            <Box display="flex" sx={{backgroundColor: '#f5f6fa', minHeight: '100vh'}}>
                {/* Бічна панель */}
                <Sidebar/>

                <Box sx={{flex: 1, marginLeft: 'calc(80px)', padding: 3, paddingBottom: 6}}>

                    <div style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
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

                    <Drawer classes={{
                        paper: "filter_container"
                    }} anchor="right" open={modalState.openNotificationDrawer}

                            onClose={() => handleModalClose("openNotificationDrawer")}>
                        <Grid p={1} container>
                            <Grid item xs={12}>
                                <Button fullWidth endIcon={<CloseIcon/>} variant={"outlined"}
                                        onClick={() => handleModalClose("openNotificationDrawer")}>
                                    Закрити
                                </Button></Grid>
                        </Grid>
                        <NotificationPanel handleListItemClick={handleListItemClick}
                                           lowQuantityProducts={lowQuantityProducts}/>
                    </Drawer>

                    {/*<SpeedDial/>*/}
                    <Routes>
                        <Route path="/crm_front_react/login" element={<Login/>}/>
                        <Route
                            path="/crm_front_react/dashboard"
                            element={
                                <ProtectedRoute element={<Dashboard/>}/>
                            }
                        />
                        <Route path="/crm_front_react/" element={
                            <ProductsCatalog
                                ref={(el, index) => {
                                    tableRowRefs.current[index] = el;
                                }}
                                searchTerm={searchTerm}
                                products={products}
                                isAuthenticated={isAuthenticated}
                                showSnackbarMessage={showSnackbarMessage}
                                lowQuantityProducts={lowQuantityProducts}
                                modalState={modalState}
                                setModalState={setModalState}
                                order={order}
                                setOrder={setOrder}
                                itemsPerPage={itemsPerPage}
                                setItemsPerPage={setItemsPerPage}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                sortProducts={sortProducts}
                                filters={filters}
                                setFilters={setFilters}
                                orderBy={orderBy}
                                setOrderBy={setOrderBy}
                                selectedLowProductId={selectedLowProductId}
                                setSelectedLowProductId={setSelectedLowProductId}
                                filteredAndSearchedProducts={filteredAndSearchedProducts}
                                getComparator={getComparator}
                                getFieldValue={getFieldValue}
                                setFilteredAndSearchedProducts={setFilteredAndSearchedProducts}
                            />
                        }/>
                        <Route path="/crm_front_react/gift_sets" element={<GiftSetsPage/>}/>
                        <Route path="/crm_front_react/clients" element={<ClientsManagement/>}/>
                        <Route path="/crm_front_react/sales" element={<Sales/>}/>
                        <Route path="/crm_front_react/products" element={
                            <ProductsCatalog
                                ref={(el, index) => {
                                    tableRowRefs.current[index] = el;
                                }}
                                searchTerm={searchTerm}
                                products={products}
                                isAuthenticated={isAuthenticated}
                                showSnackbarMessage={showSnackbarMessage}
                                lowQuantityProducts={lowQuantityProducts}
                                modalState={modalState}
                                setModalState={setModalState}
                                order={order}
                                setOrder={setOrder}
                                itemsPerPage={itemsPerPage}
                                setItemsPerPage={setItemsPerPage}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                sortProducts={sortProducts}
                                filters={filters}
                                setFilters={setFilters}
                                orderBy={orderBy}
                                setOrderBy={setOrderBy}
                                selectedLowProductId={selectedLowProductId}
                                setSelectedLowProductId={setSelectedLowProductId}
                                filteredAndSearchedProducts={filteredAndSearchedProducts}
                                getComparator={getComparator}
                                getFieldValue={getFieldValue}
                                setFilteredAndSearchedProducts={setFilteredAndSearchedProducts}
                            />

                        }/>
                        <Route path="/crm_front_react/purchases" element={<Purchases/>}/>
                        <Route path="/crm_front_react/analytics" element={<Dashboard/>}/>
                        <Route path="/crm_front_react/packaging" element={<PackagingMaterialList/>}/>
                        <Route path="/crm_front_react/other-investments" element={<InvestmentsPage/>}/>
                        <Route path="/crm_front_react/suppliers"
                               element={<SupplierPage/>}/>

                    </Routes>
                </Box>
            </Box>
        </React.Fragment>
    );
}

export default App;
