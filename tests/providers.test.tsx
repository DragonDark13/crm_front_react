import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProducts } from '../src/api/_product';
import { createCustomer, fetchGetAllCustomers } from '../src/api/_customer';
import { fetchGetAllCategories } from '../src/api/_categories';
import { fetchGetAllSuppliers } from '../src/api/_supplier';
import { fetchListPackagingMaterials } from '../src/api/_packagingMaterials';
import { fetchGiftSets } from '../src/api/_giftBox';
import { getAllInvestments } from '../src/api/_investmentsApi';
import { ProductProvider, useProducts } from '../src/components/Provider/ProductContext';
import { CustomerProvider, useCustomers } from '../src/components/Provider/CustomerContext';
import { CategoryProvider, useCategories } from '../src/components/Provider/CategoryContext';
import { SupplierProvider, useSuppliers } from '../src/components/Provider/SupplierContext';
import { PackagingProvider, usePackaging } from '../src/components/Provider/PackagingContext';
import { GiftSetProvider, useGiftSet } from '../src/components/Provider/GiftSetContext';
import { InvestmentsProvider, useInvestments } from '../src/components/Provider/InvestmentsContext';
import { SnackbarMessageProvider } from '../src/components/Provider/SnackbarMessageContext';
import { ICustomer, IProduct, ISupplierFull, IMaterial, IGiftSet, Investment } from '../src/utils/types';

vi.mock('../src/api/_product', () => ({
    fetchProducts: vi.fn()
}));

vi.mock('../src/api/_customer', () => ({
    createCustomer: vi.fn(),
    fetchGetAllCustomers: vi.fn()
}));

vi.mock('../src/api/_categories', () => ({
    fetchGetAllCategories: vi.fn()
}));

vi.mock('../src/api/_supplier', () => ({
    fetchGetAllSuppliers: vi.fn(),
    updateSupplier: vi.fn()
}));

vi.mock('../src/api/_packagingMaterials', () => ({
    fetchListPackagingMaterials: vi.fn(),
    updatePackagingSupplier: vi.fn()
}));

vi.mock('../src/api/_giftBox', () => ({
    fetchGiftSets: vi.fn(),
    removeGiftSet: vi.fn(),
    createGiftBox: vi.fn(),
    updateGiftSet: vi.fn(),
    sellGiftSet: vi.fn()
}));

vi.mock('../src/api/_investmentsApi', () => ({
    getAllInvestments: vi.fn(),
    createInvestment: vi.fn(),
    deleteInvestmentById: vi.fn(),
    deleteAllInvestments: vi.fn()
}));

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(res => {
        resolve = res;
    });
    return { promise, resolve };
};

const ProductHarness = () => {
    const { fetchProductsFunc, products } = useProducts();
    const [refreshResult, setRefreshResult] = useState('');

    return (
        <>
            <button onClick={async () => setRefreshResult(String(await fetchProductsFunc()))}>
                Refresh products
            </button>
            <span>{refreshResult}</span>
            <span data-testid="product-ids">{products.map(product => product.id).join(',')}</span>
        </>
    );
};

const CategoryHarness = () => {
    const { categories, fetchCategoriesFunc } = useCategories();
    return (
        <>
            <button onClick={() => void fetchCategoriesFunc()}>Refresh categories</button>
            <span data-testid="category-ids">{categories.map(category => category.id).join(',')}</span>
        </>
    );
};

const SupplierHarness = () => {
    const { suppliers, fetchSuppliersFunc } = useSuppliers();
    return (
        <>
            <button onClick={() => void fetchSuppliersFunc()}>Refresh suppliers</button>
            <span data-testid="supplier-ids">{suppliers.map(supplier => supplier.id).join(',')}</span>
        </>
    );
};

const PackagingHarness = () => {
    const { packagingMaterials, fetchPackagingOptions } = usePackaging();
    return (
        <>
            <button onClick={() => void fetchPackagingOptions()}>Refresh packaging</button>
            <span data-testid="packaging-ids">{packagingMaterials.map(material => material.id).join(',')}</span>
        </>
    );
};

const GiftSetHarness = () => {
    const { giftSets, fetchGiftSetsData } = useGiftSet();
    return (
        <>
            <button onClick={() => void fetchGiftSetsData()}>Refresh gift sets</button>
            <span data-testid="gift-set-ids">{giftSets.map(giftSet => giftSet.id).join(',')}</span>
        </>
    );
};

const InvestmentsHarness = () => {
    const { investments, fetchInvestments } = useInvestments();
    return (
        <>
            <button onClick={() => void fetchInvestments(false)}>Refresh investments</button>
            <span data-testid="investment-ids">{investments.map(investment => investment.id).join(',')}</span>
        </>
    );
};

const CustomerHarness = () => {
    const { customers, createCustomerFunc, fetchGetAllCustomersFunc } = useCustomers();

    return (
        <>
            <button onClick={() => void fetchGetAllCustomersFunc()}>
                Refresh customers
            </button>
            <button onClick={() => void createCustomerFunc({
                name: 'New customer',
                email: 'new@example.com',
                phone_number: '123',
                address: 'Test address'
            })}>
                Create customer
            </button>
            <span>{customers.length}</span>
            <span data-testid="customer-ids">{customers.map(customer => customer.id).join(',')}</span>
        </>
    );
};

describe('CRUD provider refresh behavior', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('returns a failed refresh result when the product GET request fails', async () => {
        vi.mocked(fetchProducts)
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce(new Error('GET failed'));

        render(
            <ProductProvider>
                <ProductHarness />
            </ProductProvider>
        );

        await waitFor(() => expect(fetchProducts).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh products' }));

        await waitFor(() => expect(screen.getByText('false')).toBeTruthy());
    });

    it('keeps the newest product response when requests finish out of order', async () => {
        let resolveOlderRequest!: (products: IProduct[]) => void;
        let resolveNewerRequest!: (products: IProduct[]) => void;
        const olderRequest = new Promise<IProduct[]>(resolve => {
            resolveOlderRequest = resolve;
        });
        const newerRequest = new Promise<IProduct[]>(resolve => {
            resolveNewerRequest = resolve;
        });

        vi.mocked(fetchProducts)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(olderRequest)
            .mockReturnValueOnce(newerRequest);

        render(
            <ProductProvider>
                <ProductHarness />
            </ProductProvider>
        );

        await waitFor(() => expect(fetchProducts).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh products' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh products' }));

        await waitFor(() => expect(fetchProducts).toHaveBeenCalledTimes(3));

        resolveNewerRequest([{ id: 2 } as IProduct]);
        await waitFor(() => expect(screen.getByTestId('product-ids').textContent).toBe('2'));

        resolveOlderRequest([{ id: 1 } as IProduct]);
        await waitFor(() => expect(screen.getByTestId('product-ids').textContent).toBe('2'));
    });


    it('keeps the newest customer response when requests finish out of order', async () => {
        let resolveOlderRequest!: (customers: ICustomer[]) => void;
        let resolveNewerRequest!: (customers: ICustomer[]) => void;
        const olderRequest = new Promise<ICustomer[]>(resolve => {
            resolveOlderRequest = resolve;
        });
        const newerRequest = new Promise<ICustomer[]>(resolve => {
            resolveNewerRequest = resolve;
        });

        vi.mocked(fetchGetAllCustomers)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(olderRequest)
            .mockReturnValueOnce(newerRequest);

        render(
            <SnackbarMessageProvider>
                <CustomerProvider>
                    <CustomerHarness />
                </CustomerProvider>
            </SnackbarMessageProvider>
        );

        await waitFor(() => expect(fetchGetAllCustomers).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh customers' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh customers' }));

        await waitFor(() => expect(fetchGetAllCustomers).toHaveBeenCalledTimes(3));

        resolveNewerRequest([{ id: 2, name: 'Newer customer' } as ICustomer]);
        await waitFor(() => expect(screen.getByTestId('customer-ids').textContent).toBe('2'));

        resolveOlderRequest([{ id: 1, name: 'Older customer' } as ICustomer]);
        await waitFor(() => expect(screen.getByTestId('customer-ids').textContent).toBe('2'));
    });

    it('shows a refresh warning after the customer was successfully created but GET failed', async () => {
        vi.mocked(fetchGetAllCustomers)
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce(new Error('GET failed'));
        vi.mocked(createCustomer).mockResolvedValueOnce({
            message: 'Customer created',
            customer: {
                id: 1,
                name: 'New customer'
            } as ICustomer
        });

        render(
            <SnackbarMessageProvider>
                <CustomerProvider>
                    <CustomerHarness />
                </CustomerProvider>
            </SnackbarMessageProvider>
        );

        await waitFor(() => expect(fetchGetAllCustomers).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Create customer' }));

        await waitFor(() => {
            expect(screen.getByText('Customer was created, but the customer list could not be refreshed.')).toBeTruthy();
        });
        expect(screen.getByTestId('customer-ids').textContent).toBe('1');
    });

    it('keeps the newest category response when requests finish out of order', async () => {
        const older = deferred<{ id: number; name: string }[]>();
        const newer = deferred<{ id: number; name: string }[]>();
        vi.mocked(fetchGetAllCategories)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);

        render(<CategoryProvider><CategoryHarness /></CategoryProvider>);
        await waitFor(() => expect(fetchGetAllCategories).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh categories' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh categories' }));
        newer.resolve([{ id: 2, name: 'Newer' }]);
        await waitFor(() => expect(screen.getByTestId('category-ids').textContent).toBe('2'));
        older.resolve([{ id: 1, name: 'Older' }]);
        await waitFor(() => expect(screen.getByTestId('category-ids').textContent).toBe('2'));
    });

    it('keeps the newest supplier response when requests finish out of order', async () => {
        const older = deferred<ISupplierFull[]>();
        const newer = deferred<ISupplierFull[]>();
        vi.mocked(fetchGetAllSuppliers)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);

        render(
            <SnackbarMessageProvider>
                <SupplierProvider><SupplierHarness /></SupplierProvider>
            </SnackbarMessageProvider>
        );
        await waitFor(() => expect(fetchGetAllSuppliers).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh suppliers' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh suppliers' }));
        newer.resolve([{ id: 2 } as ISupplierFull]);
        await waitFor(() => expect(screen.getByTestId('supplier-ids').textContent).toBe('2'));
        older.resolve([{ id: 1 } as ISupplierFull]);
        await waitFor(() => expect(screen.getByTestId('supplier-ids').textContent).toBe('2'));
    });

    it('keeps the newest packaging response when requests finish out of order', async () => {
        const older = deferred<IMaterial[]>();
        const newer = deferred<IMaterial[]>();
        vi.mocked(fetchListPackagingMaterials)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);

        render(<PackagingProvider><PackagingHarness /></PackagingProvider>);
        await waitFor(() => expect(fetchListPackagingMaterials).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh packaging' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh packaging' }));
        newer.resolve([{ id: 2 } as IMaterial]);
        await waitFor(() => expect(screen.getByTestId('packaging-ids').textContent).toBe('2'));
        older.resolve([{ id: 1 } as IMaterial]);
        await waitFor(() => expect(screen.getByTestId('packaging-ids').textContent).toBe('2'));
    });

    it('keeps the newest gift set response when requests finish out of order', async () => {
        const older = deferred<IGiftSet[]>();
        const newer = deferred<IGiftSet[]>();
        vi.mocked(fetchGiftSets)
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);

        render(
            <SnackbarMessageProvider>
                <GiftSetProvider><GiftSetHarness /></GiftSetProvider>
            </SnackbarMessageProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Refresh gift sets' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh gift sets' }));
        newer.resolve([{ id: 2 } as IGiftSet]);
        await waitFor(() => expect(screen.getByTestId('gift-set-ids').textContent).toBe('2'));
        older.resolve([{ id: 1 } as IGiftSet]);
        await waitFor(() => expect(screen.getByTestId('gift-set-ids').textContent).toBe('2'));
    });

    it('keeps the newest investment response when requests finish out of order', async () => {
        const older = deferred<Investment[]>();
        const newer = deferred<Investment[]>();
        vi.mocked(getAllInvestments)
            .mockResolvedValueOnce([])
            .mockReturnValueOnce(older.promise)
            .mockReturnValueOnce(newer.promise);

        render(
            <SnackbarMessageProvider>
                <InvestmentsProvider><InvestmentsHarness /></InvestmentsProvider>
            </SnackbarMessageProvider>
        );
        await waitFor(() => expect(getAllInvestments).toHaveBeenCalledTimes(1));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh investments' }));
        fireEvent.click(screen.getByRole('button', { name: 'Refresh investments' }));
        newer.resolve([{ id: 2 } as Investment]);
        await waitFor(() => expect(screen.getByTestId('investment-ids').textContent).toBe('2'));
        older.resolve([{ id: 1 } as Investment]);
        await waitFor(() => expect(screen.getByTestId('investment-ids').textContent).toBe('2'));
    });

});
