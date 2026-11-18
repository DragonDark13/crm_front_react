import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsCatalog, { IProductsCatalogProps } from '../src/components/pages/ProductsCatalog';
import { IProduct, ModalNames } from '../src/utils/types';
import { useProducts } from '../src/components/Provider/ProductContext';
import { useCategories } from '../src/components/Provider/CategoryContext';
import { useSuppliers } from '../src/components/Provider/SupplierContext';

const mocks = vi.hoisted(() => ({
    fetchProductsFunc: vi.fn(),
    showSnackbarMessage: vi.fn(),
    addPurchase: vi.fn(),
    addSale: vi.fn(),
    runProductInventory: vi.fn()
}));

vi.mock('../src/components/Provider/ProductContext', () => ({ useProducts: vi.fn() }));
vi.mock('../src/components/Provider/CategoryContext', () => ({ useCategories: vi.fn() }));
vi.mock('../src/components/Provider/SupplierContext', () => ({ useSuppliers: vi.fn() }));
vi.mock('../src/api/_product', () => ({
    addProduct: vi.fn(),
    addPurchase: mocks.addPurchase,
    addSale: mocks.addSale,
    deleteProduct: vi.fn(),
    updateProduct: vi.fn(),
    runProductInventory: mocks.runProductInventory
}));
vi.mock('../src/api/_supplier', () => ({ addSupplier: vi.fn() }));
vi.mock('../src/api/_categories', () => ({ addNewCategory: vi.fn() }));
vi.mock('../src/api/api', () => ({ exportToExcel: vi.fn() }));
vi.mock('../src/hooks/useNewProduct.ts', () => ({
    useNewProduct: () => ({ handleRemoveCategory: vi.fn() })
}));

vi.mock('../src/components/ResponsiveProductView/ResponsiveProductView', () => ({
    default: ({ handlePurchase, handleOpenSale, handleOpenInventory, filteredAndSearchedProducts }: {
        handlePurchase: (product: IProduct) => void;
        handleOpenSale: (product: IProduct) => void;
        handleOpenInventory: (product: IProduct) => void;
        filteredAndSearchedProducts: IProduct[];
    }) => (
        <>
            <button onClick={() => handlePurchase(filteredAndSearchedProducts[0])}>Open purchase</button>
            <button onClick={() => handleOpenSale(filteredAndSearchedProducts[0])}>Open sale</button>
            <button onClick={() => handleOpenInventory(filteredAndSearchedProducts[0])}>Open inventory</button>
        </>
    )
}));
vi.mock('../src/components/filters/FilterComponent/FilterComponent', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/productsDialogs/DeleteAllProductsDialog/DeleteAllProductsDialog', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/AddSupplierModal/AddSupplierModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/productsDialogs/AddProductModal/AddProductModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/productsDialogs/EditProductModal/EditProductModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/productsDialogs/ProductHistoryModal/ProductHistoryModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/productsDialogs/ProductInfoModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/ConfirmDeleteModal/ConfirmDeleteModal', () => ({ default: () => null }));
vi.mock('../src/components/dialogs/CreateNewCategoryModal/CreateNewCategoryModal', () => ({ default: () => null }));

vi.mock('../src/components/dialogs/productsDialogs/PurchaseProductModal/PurchaseProductModal', () => ({
    default: ({ openPurchase, purchaseDetails, setPurchaseDetails, handleSubmitPurchase }: {
        openPurchase: boolean;
        purchaseDetails: { quantity: number; purchase_price_per_item: number; purchase_total_price: number; supplier_id: number | string; purchase_date: string };
        setPurchaseDetails: (details: typeof purchaseDetails) => void;
        handleSubmitPurchase: () => void;
    }) => openPurchase ? (
        <div role="dialog" aria-label="Purchase dialog">
            <output>{purchaseDetails.quantity}</output>
            <button onClick={() => setPurchaseDetails({ ...purchaseDetails, quantity: 3, purchase_price_per_item: 12, purchase_total_price: 36 })}>Set purchase values</button>
            <button onClick={handleSubmitPurchase}>Submit purchase</button>
        </div>
    ) : null
}));
vi.mock('../src/components/dialogs/productsDialogs/SaleProductModal/SaleProductModal', () => ({
    default: ({ openSale, saleData, setSaleData, handleSale }: {
        openSale: boolean;
        saleData: { customer: number | string; quantity: number; productId: number; selling_price_per_item: number };
        setSaleData: (data: typeof saleData) => void;
        handleSale: () => void;
    }) => openSale ? (
        <div role="dialog" aria-label="Sale dialog">
            <button onClick={() => setSaleData({ ...saleData, customer: 9, quantity: 2, selling_price_per_item: 25 })}>Set sale values</button>
            <button onClick={handleSale}>Submit sale</button>
        </div>
    ) : null
}));
vi.mock('../src/components/dialogs/productsDialogs/ProductInventoryModal/ProductInventoryModal', () => ({
    default: ({ product, onSubmit }: {
        product: IProduct;
        onSubmit: (quantity: number, reason: string) => Promise<void>;
    }) => (
        <div role="dialog" aria-label="Inventory dialog">
            <span>{product.name}</span>
            <button onClick={() => onSubmit(7, 'Physical count')}>Submit inventory</button>
        </div>
    )
}));

const product = {
    id: 41,
    name: 'Test product',
    category_ids: [],
    available_quantity: 10,
    sold_quantity: 0,
    total_quantity: 10,
    purchase_total_price: 100,
    purchase_price_per_item: 10,
    selling_price_per_item: 15,
    selling_total_price: 150,
    selling_quantity: 0,
    article: 'TEST-41',
    product_description: '',
    created_date: '2026-01-01',
    supplier: { id: 2, name: 'Supplier' }
} as unknown as IProduct;

const CatalogHarness = () => {
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>({} as Record<ModalNames, boolean>);
    const props = {
        products: [product],
        isAuthenticated: true,
        showSnackbarMessage: mocks.showSnackbarMessage,
        lowQuantityProducts: [],
        modalState,
        setModalState,
        order: 'asc',
        setOrder: vi.fn(),
        itemsPerPage: 10,
        setItemsPerPage: vi.fn(),
        currentPage: 0,
        setCurrentPage: vi.fn(),
        sortProducts: (items: IProduct[]) => items,
        filters: { categories: [], suppliers: [], priceRange: [0, 1000] },
        setFilters: vi.fn(),
        orderBy: 'name',
        setOrderBy: vi.fn(),
        selectedLowProductId: null,
        setSelectedLowProductId: vi.fn(),
        filteredAndSearchedProducts: [product],
        setFilteredAndSearchedProducts: vi.fn(),
        getComparator: () => () => 0,
        getFieldValue: () => '',
        searchTerm: '',
        resetFilters: vi.fn(),
        setSearchTerm: vi.fn()
    } as unknown as IProductsCatalogProps;

    return <ProductsCatalog {...props} />;
};

const renderCatalog = () => {
    vi.mocked(useProducts).mockReturnValue({
        fetchProductsFunc: mocks.fetchProductsFunc,
        loadingState: { isLoading: false, error: null }
    } as ReturnType<typeof useProducts>);
    vi.mocked(useCategories).mockReturnValue({
        fetchCategoriesFunc: vi.fn().mockResolvedValue(true),
        categories: []
    } as ReturnType<typeof useCategories>);
    vi.mocked(useSuppliers).mockReturnValue({
        fetchSuppliersFunc: vi.fn().mockResolvedValue(true),
        suppliers: [{ id: 2, name: 'Supplier', is_active: true }]
    } as ReturnType<typeof useSuppliers>);

    return render(<CatalogHarness />);
};

describe('ProductsCatalog financial operations integration', () => {
    beforeEach(() => {
        mocks.fetchProductsFunc.mockReset().mockResolvedValue(true);
        mocks.showSnackbarMessage.mockReset();
        mocks.addPurchase.mockReset();
        mocks.addSale.mockReset();
        mocks.runProductInventory.mockReset();
    });

    afterEach(() => cleanup());

    it('submits purchase data, closes the dialog and refreshes products after success', async () => {
        mocks.addPurchase.mockResolvedValueOnce(undefined);
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open purchase' }));
        fireEvent.click(screen.getByRole('button', { name: 'Set purchase values' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit purchase' }));

        await waitFor(() => expect(mocks.addPurchase).toHaveBeenCalledWith(41, {
            quantity: 3,
            purchase_price_per_item: 12,
            purchase_total_price: 36,
            supplier_id: 2,
            purchase_date: expect.any(String)
        }));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Purchase submitted successfully!', 'success');
        expect(mocks.fetchProductsFunc).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog', { name: 'Purchase dialog' })).toBeNull();
    });

    it('keeps purchase dialog open and does not refresh or show success when purchase fails', async () => {
        mocks.addPurchase.mockRejectedValueOnce(new Error('HTTP 500: purchase failed'));
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open purchase' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit purchase' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'There was an error processing the purchase!',
            'error'
        ));
        expect(screen.getByRole('dialog', { name: 'Purchase dialog' })).toBeTruthy();
        expect(mocks.fetchProductsFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Purchase submitted successfully!', 'success');
    });

    it('reports a saved purchase separately when the product refresh fails', async () => {
        mocks.addPurchase.mockResolvedValueOnce(undefined);
        mocks.fetchProductsFunc.mockResolvedValueOnce(false);
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open purchase' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit purchase' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Purchase was saved, but the product list could not be refreshed.',
            'warning'
        ));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Purchase submitted successfully!', 'success');
    });

    it('submits sale data, closes the dialog and refreshes products after success', async () => {
        mocks.addSale.mockResolvedValueOnce(undefined);
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open sale' }));
        fireEvent.click(screen.getByRole('button', { name: 'Set sale values' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit sale' }));

        await waitFor(() => expect(mocks.addSale).toHaveBeenCalledWith(41, expect.objectContaining({
            customer: 9,
            quantity: 2,
            productId: 41,
            selling_price_per_item: 25
        })));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Sale completed successfully!', 'success');
        expect(mocks.fetchProductsFunc).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog', { name: 'Sale dialog' })).toBeNull();
    });

    it('keeps sale dialog open and does not refresh or show success when sale fails', async () => {
        mocks.addSale.mockRejectedValueOnce(new Error('HTTP 500: sale failed'));
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open sale' }));
        fireEvent.click(screen.getByRole('button', { name: 'Set sale values' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit sale' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Failed to save the sale!', 'error'));
        expect(screen.getByRole('dialog', { name: 'Sale dialog' })).toBeTruthy();
        expect(mocks.fetchProductsFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Sale completed successfully!', 'success');
    });

    it('sends inventory quantity and reason, closes the dialog and refreshes products after success', async () => {
        mocks.runProductInventory.mockResolvedValueOnce({ success: true });
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open inventory' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit inventory' }));

        await waitFor(() => expect(mocks.runProductInventory).toHaveBeenCalledWith(41, {
            actual_quantity: 7,
            reason: 'Physical count'
        }));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Інвентаризацію успішно проведено', 'success');
        expect(mocks.fetchProductsFunc).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog', { name: 'Inventory dialog' })).toBeNull();
    });

    it('keeps inventory dialog open and does not refresh or show success when inventory fails', async () => {
        mocks.runProductInventory.mockRejectedValueOnce(new Error('HTTP 403: forbidden'));
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open inventory' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit inventory' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Не вдалося провести інвентаризацію',
            'error'
        ));
        expect(screen.getByRole('dialog', { name: 'Inventory dialog' })).toBeTruthy();
        expect(mocks.fetchProductsFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith('Інвентаризацію успішно проведено', 'success');
    });

    it('warns when inventory succeeds but product refresh fails', async () => {
        mocks.runProductInventory.mockResolvedValueOnce({ success: true });
        mocks.fetchProductsFunc.mockResolvedValueOnce(false);
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open inventory' }));
        fireEvent.click(screen.getByRole('button', { name: 'Submit inventory' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Інвентаризацію проведено, але список товарів не вдалося оновити.',
            'warning'
        ));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith('Інвентаризацію успішно проведено', 'success');
    });
});
