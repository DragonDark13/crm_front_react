import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SupplierPage from '../src/components/pages/SupplierPage/SupplierPage';
import { useSuppliers } from '../src/components/Provider/SupplierContext';
import { useSnackbarMessage } from '../src/components/Provider/SnackbarMessageContext';
import { useAuth } from '../src/components/context/AuthContext';

const mocks = vi.hoisted(() => ({
    suppliers: [] as Array<Record<string, unknown>>,
    fetchSuppliersFunc: vi.fn(),
    handleToggleSupplierActive: vi.fn(),
    showSnackbarMessage: vi.fn(),
    addSupplier: vi.fn(),
    updateSupplier: vi.fn(),
    deleteSupplier: vi.fn(),
    deletePackagingSupplier: vi.fn(),
    fetchGetSupplierPurchaseHistory: vi.fn(),
    fetchGetPackagingSupplierPurchaseHistory: vi.fn(),
    canDeleteSupplier: vi.fn()
}));

vi.mock('../src/components/Provider/SupplierContext', () => ({ useSuppliers: vi.fn() }));
vi.mock('../src/components/Provider/SnackbarMessageContext', () => ({ useSnackbarMessage: vi.fn() }));
vi.mock('../src/components/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../src/api/_supplier', () => ({
    addSupplier: mocks.addSupplier,
    deleteSupplier: mocks.deleteSupplier,
    fetchGetSupplierProducts: vi.fn(),
    fetchGetSupplierPurchaseHistory: mocks.fetchGetSupplierPurchaseHistory,
    updateSupplier: mocks.updateSupplier
}));
vi.mock('../src/api/_packagingMaterials', () => ({
    deletePackagingSupplier: mocks.deletePackagingSupplier,
    fetchGetPackagingSupplierPurchaseHistory: mocks.fetchGetPackagingSupplierPurchaseHistory,
    updatePackagingSupplier: vi.fn()
}));
vi.mock('../src/components/pages/SupplierPage/canDeleteSupplier', () => ({
    canDeleteSupplier: mocks.canDeleteSupplier
}));
vi.mock('../src/components/Buttons/AddButton', () => ({
    default: ({ onClick, text }: { onClick: () => void; text: string }) => <button onClick={onClick}>{text}</button>
}));
vi.mock('../src/components/_elements/RenderHeaderCell', () => ({
    default: ({ children }: { children: React.ReactNode }) => <th>{children}</th>
}));
vi.mock('../src/components/pages/PurchasesPage/PurchasesTableTypeProductCell', () => ({
    default: ({ type }: { type: string }) => <span>{type}</span>
}));
vi.mock('../src/components/pages/SupplierPage/SupplierPurchaseHistoryTable', () => ({
    default: ({ type, supplierId, purchaseHistory }: { type?: string; supplierId?: number; purchaseHistory: Array<{ product?: string; material?: string }> }) => (
        <div data-testid="supplier-purchase-history">{type}:{supplierId}:{purchaseHistory.map(item => item.product || item.material || '').join(',')}</div>
    )
}));

const supplier = {
    id: 12,
    name: 'ТОВ Постачальник Тестовий',
    contact_info: 'Менеджер',
    email: 'supplier@example.com',
    phone_number: '+380501112233',
    address: 'Харків',
    is_active: true,
    type: 'product' as const
};

const getSupplierRow = (name: string) => {
    const supplierName = screen.getAllByText(name).find(element => element.closest('tr'));
    expect(supplierName).toBeTruthy();
    return supplierName!.closest('tr') as HTMLElement;
};

const expectSupplierHistory = async (text: string) => {
    const histories = await screen.findAllByTestId('supplier-purchase-history');
    expect(histories.some(history => history.textContent?.includes(text))).toBe(true);
};

const renderSupplierPage = (isAuthenticated = true, supplierList = [supplier]) => {
    vi.mocked(useSuppliers).mockReturnValue({
        suppliers: supplierList,
        fetchSuppliersFunc: mocks.fetchSuppliersFunc,
        handleToggleSupplierActive: mocks.handleToggleSupplierActive
    } as unknown as ReturnType<typeof useSuppliers>);
    vi.mocked(useSnackbarMessage).mockReturnValue({
        showSnackbarMessage: mocks.showSnackbarMessage
    });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated } as ReturnType<typeof useAuth>);

    return render(<SupplierPage />);
};

describe('SupplierPage integration', () => {
    beforeEach(() => {
        mocks.fetchSuppliersFunc.mockReset().mockResolvedValue(true);
        mocks.handleToggleSupplierActive.mockReset().mockResolvedValue(undefined);
        mocks.showSnackbarMessage.mockReset();
        mocks.addSupplier.mockReset();
        mocks.updateSupplier.mockReset();
        mocks.deleteSupplier.mockReset();
        mocks.deletePackagingSupplier.mockReset();
        mocks.fetchGetSupplierPurchaseHistory.mockReset().mockResolvedValue({
            purchase_history: [{ product: 'Test product', quantity_purchase: 2 }],
            products: []
        });
        mocks.fetchGetPackagingSupplierPurchaseHistory.mockReset().mockResolvedValue({
            purchase_history: [{ material: 'Packaging history' }]
        });
        mocks.canDeleteSupplier.mockReset().mockResolvedValue({ canDelete: true });
    });

    afterEach(() => cleanup());

    it('creates a supplier, closes the dialog and refreshes the supplier list', async () => {
        mocks.addSupplier.mockResolvedValueOnce({ supplier_id: 13 });
        renderSupplierPage();

        fireEvent.click(screen.getByRole('button', { name: /Додати постачальника/ }));
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Назва Постачальника' }), {
            target: { value: 'Новий тестовий постачальник' }
        });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти постачальника' }));

        await waitFor(() => expect(mocks.addSupplier).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Новий тестовий постачальник'
        })));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(mocks.fetchSuppliersFunc).toHaveBeenCalledOnce();
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Supplier completed successfully!', 'success');
    });

    it('keeps the create dialog open and displays an error when supplier creation fails', async () => {
        mocks.addSupplier.mockRejectedValueOnce(new Error('HTTP 500: supplier creation failed'));
        renderSupplierPage();

        fireEvent.click(screen.getByRole('button', { name: /Додати постачальника/ }));
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Назва Постачальника' }), {
            target: { value: 'Новий тестовий постачальник' }
        });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти постачальника' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'There was an error saving the supplier!',
            'error'
        ));
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(mocks.fetchSuppliersFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Supplier completed successfully!', 'success');
    });

    it('updates a supplier and closes the edit dialog after success', async () => {
        mocks.updateSupplier.mockResolvedValueOnce({ status: 200 });
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[0]);
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Назва постачальника' }), {
            target: { value: 'ТОВ Оновлений постачальник' }
        });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

        await waitFor(() => expect(mocks.updateSupplier).toHaveBeenCalledWith(12, expect.objectContaining({
            name: 'ТОВ Оновлений постачальник'
        })));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(mocks.fetchSuppliersFunc).toHaveBeenCalledOnce();
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Supplier completed successfully!', 'success');
    });

    it('does not show a success message or close the edit dialog when supplier update fails', async () => {
        mocks.updateSupplier.mockRejectedValueOnce(new Error('HTTP 500: update failed'));
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[0]);
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Назва постачальника' }), {
            target: { value: 'ТОВ Оновлений постачальник' }
        });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

        await waitFor(() => expect(mocks.updateSupplier).toHaveBeenCalledOnce());
        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'There was an error updating the supplier!',
            'error'
        ));
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(mocks.fetchSuppliersFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Supplier completed successfully!', 'success');
    });

    it('checks supplier dependencies before opening the delete confirmation', async () => {
        mocks.canDeleteSupplier.mockResolvedValueOnce({
            canDelete: false,
            reason: 'Наявні пов’язані закупівлі.'
        });
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[3]);

        await waitFor(() => expect(mocks.canDeleteSupplier).toHaveBeenCalledWith(12, 'product'));
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Наявні пов’язані закупівлі.', 'warning');
    });

    it('deletes a supplier after dependency validation and refreshes the list', async () => {
        mocks.deleteSupplier.mockResolvedValueOnce(undefined);
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[3]);
        await waitFor(() => expect(mocks.canDeleteSupplier).toHaveBeenCalledOnce());
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

        await waitFor(() => expect(mocks.deleteSupplier).toHaveBeenCalledWith(12));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Постачальника успішно видалено', 'success');
        expect(mocks.fetchSuppliersFunc).toHaveBeenCalledOnce();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('shows an error and never a success message when supplier deletion fails', async () => {
        mocks.deleteSupplier.mockRejectedValueOnce(new Error('HTTP 403: forbidden'));
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[3]);
        await waitFor(() => expect(mocks.canDeleteSupplier).toHaveBeenCalledOnce());
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Помилка при видаленні постачальника',
            'error'
        ));
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Постачальника успішно видалено', 'success');
        expect(mocks.fetchSuppliersFunc).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('loads and renders the supplier purchase history', async () => {
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[1]);

        await waitFor(() => expect(mocks.fetchGetSupplierPurchaseHistory).toHaveBeenCalledWith(12));
        await expectSupplierHistory('product:12:Test product');
    });

    it('delegates supplier activation to the provider with the selected supplier type', () => {
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[2]);

        expect(mocks.handleToggleSupplierActive).toHaveBeenCalledWith(12, supplier, 'product');
    });
    it('distinguishes product and packaging suppliers with the same ID', async () => {
        const packagingSupplier = {...supplier, type: 'packaging' as const, name: 'Packaging supplier'};
        renderSupplierPage(true, [supplier, packagingSupplier]);

        const productRow = getSupplierRow(supplier.name);
        fireEvent.click(within(productRow).getAllByRole('button')[1]);
        await expectSupplierHistory('product:12:Test product');

        const packagingRow = getSupplierRow(packagingSupplier.name);
        fireEvent.click(within(packagingRow).getAllByRole('button')[1]);
        await expectSupplierHistory('packaging:12:Packaging history');
        expect(mocks.fetchGetPackagingSupplierPurchaseHistory).toHaveBeenCalledWith(12);
    });

    it('ignores an older supplier history response after a newer request completes', async () => {
        let resolveOlder!: (value: {purchase_history: Array<{product: string}>; products: never[]}) => void;
        let resolveNewer!: (value: {purchase_history: Array<{product: string}>; products: never[]}) => void;
        const olderRequest = new Promise<{purchase_history: Array<{product: string}>; products: never[]}>(resolve => {
            resolveOlder = resolve;
        });
        const newerRequest = new Promise<{purchase_history: Array<{product: string}>; products: never[]}>(resolve => {
            resolveNewer = resolve;
        });
        mocks.fetchGetSupplierPurchaseHistory
            .mockReturnValueOnce(olderRequest)
            .mockReturnValueOnce(newerRequest);
        const secondSupplier = {...supplier, id: 14, name: 'Second supplier'};
        renderSupplierPage(true, [supplier, secondSupplier]);

        const firstRow = getSupplierRow(supplier.name);
        const secondRow = getSupplierRow(secondSupplier.name);
        fireEvent.click(within(firstRow).getAllByRole('button')[1]);
        fireEvent.click(within(secondRow).getAllByRole('button')[1]);

        resolveNewer({purchase_history: [{product: 'Newest history'}], products: []});
        await expectSupplierHistory('product:14:Newest history');
        resolveOlder({purchase_history: [{product: 'Stale history'}], products: []});

        await waitFor(async () => {
            const histories = screen.getAllByTestId('supplier-purchase-history');
            expect(histories.some(history => history.textContent?.includes('product:14:Newest history'))).toBe(true);
        });
        expect(screen.queryByText(/Stale history/)).toBeNull();
    });

    it('shows history loading and error states when the history request fails', async () => {
        let rejectRequest!: (error: Error) => void;
        const pendingRequest = new Promise<never>((_, reject) => {
            rejectRequest = reject;
        });
        mocks.fetchGetSupplierPurchaseHistory.mockReturnValueOnce(pendingRequest);
        renderSupplierPage();

        const supplierRow = getSupplierRow(supplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[1]);
        expect(screen.getAllByText('Завантаження історії постачальника...').length).toBeGreaterThan(0);

        rejectRequest(new Error('History request failed'));
        expect((await screen.findAllByText('Не вдалося завантажити історію постачальника.')).length).toBeGreaterThan(0);
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Не вдалося завантажити історію постачальника.',
            'error'
        );
    });

    it('clamps the current pagination page when the supplier list shrinks', async () => {
        const suppliers = Array.from({length: 11}, (_, index) => ({
            ...supplier,
            id: index + 1,
            name: `Supplier ${index + 1}`
        }));
        const {rerender} = renderSupplierPage(true, suppliers);

        fireEvent.click(screen.getAllByLabelText('Go to next page')[0]);
        expect(screen.getAllByLabelText('Go to previous page')[0].hasAttribute('disabled')).toBe(false);

        vi.mocked(useSuppliers).mockReturnValue({
            suppliers: suppliers.slice(0, 10),
            fetchSuppliersFunc: mocks.fetchSuppliersFunc,
            handleToggleSupplierActive: mocks.handleToggleSupplierActive
        } as unknown as ReturnType<typeof useSuppliers>);
        rerender(<SupplierPage />);

        await waitFor(() => {
            expect(screen.getAllByLabelText('Go to previous page').every(button => button.hasAttribute('disabled'))).toBe(true);
        });
    });

    it('deletes a packaging supplier through the packaging delete API', async () => {
        const packagingSupplier = {...supplier, type: 'packaging' as const};
        mocks.deletePackagingSupplier.mockResolvedValueOnce(undefined);
        renderSupplierPage(true, [packagingSupplier]);

        const supplierRow = getSupplierRow(packagingSupplier.name);
        fireEvent.click(within(supplierRow).getAllByRole('button')[3]);
        await waitFor(() => expect(mocks.canDeleteSupplier).toHaveBeenCalledWith(12, 'packaging'));

        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', {name: 'Видалити'}));

        await waitFor(() => expect(mocks.deletePackagingSupplier).toHaveBeenCalledWith(12));
        expect(mocks.deleteSupplier).not.toHaveBeenCalled();
    });

});
