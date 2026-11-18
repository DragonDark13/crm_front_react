import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PurchaseProductModal from '../src/components/dialogs/productsDialogs/PurchaseProductModal/PurchaseProductModal';
import { IPurchaseData } from '../src/utils/types';
import { useSuppliers } from '../src/components/Provider/SupplierContext';

vi.mock('../src/components/Provider/SupplierContext', () => ({
    useSuppliers: vi.fn()
}));
vi.mock('../src/components/dialogs/CustomDialog/CustomDialog', () => ({
    default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
        open ? <div role="dialog">{children}</div> : null
}));
vi.mock('../src/components/FormComponents/SupplierSelect', () => ({
    default: () => null
}));
vi.mock('../src/components/FormComponents/QuantityField', () => ({
    default: ({ value, onDecrement }: { value: number; onDecrement: () => void }) => (
        <div>
            <output data-testid="purchase-quantity">{value}</output>
            <button onClick={onDecrement}>Decrease quantity</button>
        </div>
    )
}));
vi.mock('../src/components/FormComponents/PriceField', () => ({
    default: () => null
}));
vi.mock('../src/components/FormComponents/TotalPriceField', () => ({
    default: ({ value }: { value: number }) => <output>{value}</output>
}));

const initialPurchaseDetails = (quantity: number) => ({
    quantity,
    purchase_price_per_item: 10,
    purchase_total_price: quantity * 10,
    supplier_id: 2,
    purchase_date: '2026-11-18'
}) as IPurchaseData;

const PurchaseModalHarness = ({ initialQuantity }: { initialQuantity: number }) => {
    const [purchaseDetails, setPurchaseDetails] = useState<IPurchaseData>(
        initialPurchaseDetails(initialQuantity)
    );

    return (
        <PurchaseProductModal
            openPurchase
            handleClosePurchase={vi.fn()}
            purchaseDetails={purchaseDetails}
            setPurchaseDetails={setPurchaseDetails}
            handleSubmitPurchase={vi.fn()}
            nameProduct="Test product"
            isAuthenticated
        />
    );
};

describe('PurchaseProductModal quantity controls', () => {
    beforeEach(() => {
        vi.mocked(useSuppliers).mockReturnValue({
            suppliers: [{ id: 2, name: 'Supplier', is_active: true }]
        } as ReturnType<typeof useSuppliers>);
    });

    afterEach(() => cleanup());

    it('decreases the current purchase quantity by exactly one', () => {
        render(<PurchaseModalHarness initialQuantity={5} />);

        fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));

        expect(screen.getByTestId('purchase-quantity').textContent).toBe('4');
    });

    it('does not decrease the purchase quantity below one', () => {
        render(<PurchaseModalHarness initialQuantity={1} />);

        fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));

        expect(screen.getByTestId('purchase-quantity').textContent).toBe('1');
    });
});
