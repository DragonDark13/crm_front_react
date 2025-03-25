import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {CssBaseline} from "@mui/material";
import {CategoryProvider} from "./components/Provider/CategoryContext";
import {CustomerProvider} from "./components/Provider/CustomerContext";
import {SupplierProvider} from "./components/Provider/SupplierContext";
import {ProductProvider} from "./components/Provider/ProductContext";
import {SnackbarMessageProvider} from "./components/Provider/SnackbarMessageContext";
import {AuthProvider} from "./components/context/AuthContext";
import {PackagingProvider} from "./components/Provider/PackagingContext";
import {GiftSetProvider} from "./components/Provider/GiftSetContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.Fragment>
        <AuthProvider>
            <SnackbarMessageProvider>
                <GiftSetProvider>
                    <ProductProvider>
                        <SupplierProvider>
                            <CategoryProvider>
                                <CustomerProvider>
                                    <PackagingProvider>
                                        <App/>
                                    </PackagingProvider>
                                </CustomerProvider>
                            </CategoryProvider>
                        </SupplierProvider>
                    </ProductProvider>
                </GiftSetProvider>
            </SnackbarMessageProvider>
        </AuthProvider>
    </React.Fragment>
    ,
)
