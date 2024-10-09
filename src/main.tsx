import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {CssBaseline} from "@mui/material";
import {CategoryProvider} from "./components/Provider/CategoryContext";
import {CustomerProvider} from "./components/Provider/CustomerContext";
import {SupplierProvider} from "./components/Provider/SupplierContext";
import {ProductProvider} from "./components/Provider/ProductContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ProductProvider>
            <SupplierProvider>
                <CategoryProvider>
                    <CustomerProvider>
                        <CssBaseline/>
                        <App/>
                    </CustomerProvider>
                </CategoryProvider>
            </SupplierProvider>
        </ProductProvider>
    </React.StrictMode>,
)
