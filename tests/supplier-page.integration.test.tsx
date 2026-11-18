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
    deletePackagingSupplier: vi.fn(),
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
    default: ({ purchaseHistory }: { purchaseHistory: unknown[] }) => (
        <div data-testid="supplier-purchase-history">Records: {purchaseHistory.length}</div>
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

const renderSupplierPage = (isAuthenticated = true) => {
    vi.mocked(useSuppliers).mockReturnValue({
        suppliers: [supplier],
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
        mocks.fetchGetSupplierPurchaseHistory.mockReset().mockResolvedValue({
            purchase_history: [{ product: 'Test product', quantity_purchase: 2 }],
            products: []
        });
        mocks.fetchGetPackagingSupplierPurchaseHistory.mockReset();
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

        fireEvent.click(screen.getByTitle('Редагувати'));
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

        fireEvent.click(screen.getByTitle('Редагувати'));
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByRole('textbox', { name: 'Назва постачальника' }), {
            target: { value: 'ТОВ Оновлений постачальник' }
        });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

        await waitFor(() => expect(mocks.updateSupplier).toHaveBeenCalledOnce());
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

        fireEvent.click(screen.getByTitle('Видалити постачальника'));

        await waitFor(() => expect(mocks.canDeleteSupplier).toHaveBeenCalledWith(12, 'product'));
        expect(screen.queryByText('Підтвердження видалення')).toBeNull();
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Наявні пов’язані закупівлі.', 'warning');
    });

    it('deletes a supplier after dependency validation and refreshes the list', async () => {
        mocks.deleteSupplier.mockResolvedValueOnce(undefined);
        renderSupplierPage();

        fireEvent.click(screen.getByTitle('Видалити постачальника'));
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

        fireEvent.click(screen.getByTitle('Видалити постачальника'));
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

        fireEvent.click(screen.getByTitle('Історія постачальника'));

        await waitFor(() => expect(mocks.fetchGetSupplierPurchaseHistory).toHaveBeenCalledWith(12));
        expect(await screen.findByTestId('supplier-purchase-history')).toHaveTextContent('Records: 1');
    });

    it('delegates supplier activation to the provider with the selected supplier type', () => {
        renderSupplierPage();

        fireEvent.click(screen.getByTitle('Відключити постачальника'));

        expect(mocks.handleToggleSupplierActive).toHaveBeenCalledWith(12, supplier, 'product');
    });
});
