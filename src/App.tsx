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

import ProductHistoryModal from "./components/dialogs/ProductHistoryModal/ProductHistoryModal";
import {CircularProgress, Typography} from '@mui/material'; // Імпорт компонентів Material-UI

//TODO add handle error
//TODO сторінкі Товари Продажі Упаковки


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
import AddProductModal from "./components/dialogs/AddProductModal/AddProductModal";
import EditProductModal from "./components/dialogs/EditProductModal/EditProductModal";
import PurchaseProductModal from "./components/dialogs/PurchaseProductModal/PurchaseProductModal";
import SaleProductModal from "./components/dialogs/SaleProductModal/SaleProductModal";
import CreateNewCategoryModal from "./components/dialogs/CreateNewCategoryModal/CreateNewCategoryModal";
import AddSupplierModal from "./components/dialogs/AddSupplierModal/AddSupplierModal";
import FilterComponent from "./components/filters/FilterComponent/FilterComponent";
import {
    ICategory,
    IEditProduct,
    INewProduct,
    INewSupplier,
    IProduct,
    IPurchaseData,
    ISaleData, IStateFilters,
    ISupplier, modalNames, ModalNames
} from "./utils/types";
import ResponsiveProductView from "./components/ResponsiveProductView/ResponsiveProductView";
import NotificationPanel from "./components/NotificationPanel/NotificationPanel";
import {formatDate} from "./utils/function";
import ConfirmDeleteModal from "./components/dialogs/ConfirmDeleteModal/ConfirmDeleteModal";
import SupplierDetails from "./components/SupplierDetails/SupplierDetails";
import CustomerPage from "./components/CustomerPage/CustomerPage";
import {useProducts} from "./components/Provider/ProductContext";
import Dashboard from "./components/Dachboard/Dashboard";
import ProductsCatalog from "./components/pages/ProductsCatalog";
import ReportsAnalytics from "./components/pages/ReportsAnalytics";
import Sales from "./components/pages/Sales";
import ClientsManagement from "./components/pages/ClientsManagement";
import Purchases from "./components/pages/Purchases";
import MainMenu from "./components/MainMenu/MainMenu";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "./components/Dachboard/Sidebar";
import SpeedDial from "./components/SpeedDial/SpeedDial";


function App() {


    return (
        <Router>
            <CssBaseline/>
            <Box display="flex" sx={{backgroundColor: '#f5f6fa', minHeight: '100vh'}}>
                {/* Бічна панель */}
                <Sidebar/>

                <Box sx={{flex: 1, marginLeft: 'calc(80px)', padding: 3,paddingBottom:6}}>
                    {/*<SpeedDial/>*/}
                    <Routes>
                        <Route path="/crm_front_react/" element={<ProductsCatalog/>}/>
                        <Route path="/crm_front_react/clients" element={<ClientsManagement/>}/>
                        <Route path="/crm_front_react/sales" element={<Sales/>}/>
                        <Route path="/crm_front_react/products" element={<ProductsCatalog/>}/>
                        <Route path="/crm_front_react/purchases" element={<Purchases/>}/>
                        <Route path="/crm_front_react/analytics" element={<ReportsAnalytics/>}/>
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
