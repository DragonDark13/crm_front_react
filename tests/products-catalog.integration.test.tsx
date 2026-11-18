import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductsCatalog, { IProductsCatalogProps } from '../src/components/pages/ProductsCatalog';
import { IProduct, ModalNames } from '../src/utils/types';
import { useProducts } from '../src/components/Provider/ProductContext';
import { useCategories } from '../src/components/Provider/CategoryContext';
import { useSuppliers } from '../src/components/Provider/SupplierContext';

const mocks = vi.hoisted(() => ({
    fetchProductsFunc: vi.fn(),
    showSnackbarMessage: vi.fn(),
    deleteProduct: vi.fn()
}));

vi.mock('../src/components/Provider/ProductContext', () => ({
    useProducts: vi.fn()
}));
vi.mock('../src/components/Provider/CategoryContext', () => ({
    useCategories: vi.fn()
}));
vi.mock('../src/components/Provider/SupplierContext', () => ({
    useSuppliers: vi.fn()
}));
vi.mock('../src/api/_product', () => ({
    addProduct: vi.fn(),
    addPurchase: vi.fn(),
    addSale: vi.fn(),
    deleteProduct: mocks.deleteProduct,
    updateProduct: vi.fn(),
    runProductInventory: vi.fn()
}));
vi.mock('../src/api/_supplier', () => ({ addSupplier: vi.fn() }));
vi.mock('../src/api/_categories', () => ({ addNewCategory: vi.fn() }));
vi.mock('../src/api/api', () => ({ exportToExcel: vi.fn() }));
vi.mock('../src/hooks/useNewProduct.ts', () => ({
    useNewProduct: () => ({ handleRemoveCategory: vi.fn() })
}));
vi.mock('../src/components/ResponsiveProductView/ResponsiveProductView', () => ({
    default: ({ handleDelete }: { handleDelete: (id: number) => void }) => (
        <button onClick={() => handleDelete(41)}>Open product delete</button>
    )
}));
vi.mock('../src/components/dialogs/ConfirmDeleteModal/ConfirmDeleteModal', () => ({
    default: ({
        openConfirmDeleteModal,
        selectedDeleteModalProductId,
        handleDelete
    }: {
        openConfirmDeleteModal: boolean;
        selectedDeleteModalProductId: number;
        handleDelete: (id: number) => void;
    }) => openConfirmDeleteModal ? (
        <div role="dialog">
            <button onClick={() => handleDelete(selectedDeleteModalProductId)}>Confirm product delete</button>
        </div>
    ) : null
}));
vi.mock('../src/components/dialogs/productsDialogs/DeleteAllProductsDialog/DeleteAllProductsDialog', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/AddSupplierModal/AddSupplierModal', () => ({
    default: () => null
}));
vi.mock('../src/components/filters/FilterComponent/FilterComponent', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/AddProductModal/AddProductModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/EditProductModal/EditProductModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/ProductHistoryModal/ProductHistoryModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/PurchaseProductModal/PurchaseProductModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/SaleProductModal/SaleProductModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/CreateNewCategoryModal/CreateNewCategoryModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/ProductInfoModal', () => ({
    default: () => null
}));
vi.mock('../src/components/dialogs/productsDialogs/ProductInventoryModal/ProductInventoryModal', () => ({
    default: () => null
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

const initialModalState = {} as Record<ModalNames, boolean>;

const CatalogHarness = () => {
    const [modalState, setModalState] = useState<Record<ModalNames, boolean>>(initialModalState);
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
        suppliers: []
    } as ReturnType<typeof useSuppliers>);

    return render(<CatalogHarness />);
};

describe('ProductsCatalog CRUD integration', () => {
    afterEach(() => cleanup());

    beforeEach(() => {
        mocks.fetchProductsFunc.mockReset().mockResolvedValue(true);
        mocks.showSnackbarMessage.mockReset();
        mocks.deleteProduct.mockReset();
    });

    it('keeps the delete confirmation open and shows an error when product deletion fails', async () => {
        mocks.deleteProduct.mockRejectedValueOnce(new Error('HTTP 403: forbidden'));
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open product delete' }));
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm product delete' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Failed to delete the product!',
            'error'
        ));
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(mocks.fetchProductsFunc).not.toHaveBeenCalled();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith(
            'Product deleted successfully!',
            'success'
        );
    });

    it('reports product deletion success separately when the following GET refresh fails', async () => {
        mocks.deleteProduct.mockResolvedValueOnce({ success: true });
        mocks.fetchProductsFunc.mockResolvedValueOnce(false);
        renderCatalog();

        fireEvent.click(screen.getByRole('button', { name: 'Open product delete' }));
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm product delete' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Product deleted successfully!',
            'success'
        ));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Product was deleted, but the product list could not be refreshed.',
            'warning'
        );
        expect(mocks.fetchProductsFunc).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
