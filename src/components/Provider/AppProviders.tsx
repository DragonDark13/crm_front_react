import React, {PropsWithChildren} from 'react';
import {AuthProvider} from '../context/AuthContext';
import {SnackbarMessageProvider} from './SnackbarMessageContext';
import {GiftSetProvider} from './GiftSetContext';
import {ProductProvider} from './ProductContext';
import {SupplierProvider} from './SupplierContext';
import {CategoryProvider} from './CategoryContext';
import {CustomerProvider} from './CustomerContext';
import {PackagingProvider} from './PackagingContext';
import {InvestmentsProvider} from './InvestmentsContext';

export const AppProviders: React.FC<PropsWithChildren> = ({children}) => (
    <AuthProvider>
        <SnackbarMessageProvider>
            <GiftSetProvider>
                <ProductProvider>
                    <SupplierProvider>
                        <CategoryProvider>
                            <CustomerProvider>
                                <PackagingProvider>
                                    <InvestmentsProvider>
                                        {children}
                                    </InvestmentsProvider>
                                </PackagingProvider>
                            </CustomerProvider>
                        </CategoryProvider>
                    </SupplierProvider>
                </ProductProvider>
            </GiftSetProvider>
        </SnackbarMessageProvider>
    </AuthProvider>
);
