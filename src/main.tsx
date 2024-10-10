import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {CssBaseline} from "@mui/material";
import {CategoryProvider} from "./components/Provider/CategoryContext";
import {CustomerProvider} from "./components/Provider/CustomerContext";
import {SupplierProvider} from "./components/Provider/SupplierContext";
import {ProductProvider} from "./components/Provider/ProductContext";
import {SnackbarMessageProvider} from "./components/Provider/SnackbarMessageContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ProductProvider>
            <SupplierProvider>
                <CategoryProvider>
                    <CustomerProvider>
                        <SnackbarMessageProvider>
                            <App/>
                        </SnackbarMessageProvider>
                    </CustomerProvider>
                </CategoryProvider>
            </SupplierProvider>
        </ProductProvider>
    </React.StrictMode>
    ,
)
