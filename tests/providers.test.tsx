import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProducts } from '../src/api/_product';
import { createCustomer, fetchGetAllCustomers } from '../src/api/_customer';
import { ProductProvider, useProducts } from '../src/components/Provider/ProductContext';
import { CustomerProvider, useCustomers } from '../src/components/Provider/CustomerContext';
import { SnackbarMessageProvider } from '../src/components/Provider/SnackbarMessageContext';
import { ICustomer, IProduct } from '../src/utils/types';

vi.mock('../src/api/_product', () => ({
    fetchProducts: vi.fn()
}));

vi.mock('../src/api/_customer', () => ({
    createCustomer: vi.fn(),
    fetchGetAllCustomers: vi.fn()
}));

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

const CustomerHarness = () => {
    const { customers, createCustomerFunc } = useCustomers();

    return (
        <>
            <button onClick={() => void createCustomerFunc({
                name: 'New customer',
                email: 'new@example.com',
                phone_number: '123',
                address: 'Test address'
            })}>
                Create customer
            </button>
            <span>{customers.length}</span>
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

    it('shows a refresh warning after the customer was successfully created but GET failed', async () => {
        vi.mocked(fetchGetAllCustomers)
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce(new Error('GET failed'));
        vi.mocked(createCustomer).mockResolvedValueOnce({
            id: 1,
            name: 'New customer'
        } as ICustomer);

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
        expect(screen.getByText('1')).toBeTruthy();
    });
});
