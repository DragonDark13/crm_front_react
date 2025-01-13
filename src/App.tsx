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


import './scss/main.scss';

import Dashboard from "./components/Dachboard/Dashboard";
import ProductsCatalog from "./components/pages/ProductsCatalog";
import ReportsAnalytics from "./components/pages/ReportsAnalytics";
import Sales from "./components/pages/Sales";
import ClientsManagement from "./components/pages/ClientsManagement";
import Purchases from "./components/pages/PurchasesPage/Purchases";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "./components/Dachboard/Sidebar";
import SpeedDial from "./components/SpeedDial/SpeedDial";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./components/Login/Login";
import PackagingMaterialList from "./components/pages/PackagingMaterialList";
import InvestmentsPage from "./components/pages/InvestmentsPage";
import SupplierPage from "./components/pages/SupplierPage";


function App() {

    return (
        <Router>
            <CssBaseline/>
            <Box display="flex" sx={{backgroundColor: '#f5f6fa', minHeight: '100vh'}}>
                {/* Бічна панель */}
                <Sidebar/>

                <Box sx={{flex: 1, marginLeft: 'calc(80px)', padding: 3, paddingBottom: 6}}>
                    {/*<SpeedDial/>*/}
                    <Routes>
                        <Route path="/crm_front_react/login" element={<Login/>}/>
                        <Route
                            path="/crm_front_react/dashboard"
                            element={
                                <ProtectedRoute element={<Dashboard/>}/>
                            }
                        />
                        <Route path="/crm_front_react/" element={<ProductsCatalog/>}/>
                        <Route path="/crm_front_react/clients" element={<ClientsManagement/>}/>
                        <Route path="/crm_front_react/sales" element={<Sales/>}/>
                        <Route path="/crm_front_react/products" element={<ProductsCatalog/>}/>
                        <Route path="/crm_front_react/purchases" element={<Purchases/>}/>
                        <Route path="/crm_front_react/analytics" element={<ReportsAnalytics/>}/>
                        <Route path="/crm_front_react/packaging" element={<PackagingMaterialList/>}/>
                        <Route path="/crm_front_react/other-investments" element={<InvestmentsPage/>}/>
                        <Route path="/crm_front_react/suppliers"
                               element={<SupplierPage/>}/>

                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
