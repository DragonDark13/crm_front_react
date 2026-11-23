import {beforeEach, describe, expect, it} from 'vitest';
import {axiosInstance} from '../src/api/api';
import demoAdapter from '../src/mocks/demoAdapter';
import {DEMO_STORAGE_KEY} from '../src/mocks/demoData';

const demoConfig = {adapter: demoAdapter};

describe('Demo API history and export', () => {
    beforeEach(async () => {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        await axiosInstance.post('/reset-database', {}, demoConfig);
    });

    it('returns seeded product stock, purchase and audit history', async () => {
        const response = await axiosInstance.get('/product/1/history', demoConfig);

        expect(response.data.stock_history.length).toBeGreaterThan(0);
        expect(response.data.purchase_history).toEqual(expect.arrayContaining([
            expect.objectContaining({product_id: 1, quantity_purchase: 30})
        ]));
        expect(response.data.audit_history).toEqual(expect.arrayContaining([
            expect.objectContaining({product_id: 1, action: 'sale'})
        ]));
    });

    it('records product purchases and sales in the corresponding histories', async () => {
        await axiosInstance.post('/product/1/purchase', {
            quantity: 2,
            purchase_price_per_item: 60,
            purchase_total_price: 120,
            supplier_id: 1
        }, demoConfig);

        await axiosInstance.post('/product/1/sale', {
            customer: 1,
            quantity: 1,
            selling_price_per_item: 130,
            selling_total_price: 130,
            packaging_id: 1,
            packaging_quantity: 1,
            total_packaging_cost: 18
        }, demoConfig);

        const productHistory = await axiosInstance.get('/product/1/history', demoConfig);
        const packagingHistory = await axiosInstance.get('/materials/1/history', demoConfig);

        expect(productHistory.data.purchase_history).toHaveLength(2);
        expect(productHistory.data.stock_history).toEqual(expect.arrayContaining([
            expect.objectContaining({change_type: 'purchase', change_amount: 2}),
            expect.objectContaining({change_type: 'sale', change_amount: -1})
        ]));
        expect(productHistory.data.audit_history).toEqual(expect.arrayContaining([
            expect.objectContaining({action: 'purchase'}),
            expect.objectContaining({action: 'sale'})
        ]));
        expect(packagingHistory.data.sales_history).toEqual(expect.arrayContaining([
            expect.objectContaining({sale_id: 4, packaging_quantity: 1})
        ]));
    });

    it('records packaging usage in stock history', async () => {
        await axiosInstance.post('/update_packaging_status', {
            material_id: 1,
            quantity_used: 2
        }, demoConfig);

        const response = await axiosInstance.get('/materials/1/history', demoConfig);

        expect(response.data.stock_history).toEqual(expect.arrayContaining([
            expect.objectContaining({change_type: 'used', change_amount: -2})
        ]));
    });

    it('returns an Excel-compatible workbook blob for product export', async () => {
        const response = await axiosInstance.post('/export-products-excel', {
            product_ids: [1, 2]
        }, {...demoConfig, responseType: 'blob'});

        expect(response.data).toBeInstanceOf(Blob);
        expect(response.data.type).toBe('application/vnd.ms-excel');
        expect(response.data.size).toBeGreaterThan(0);
    });

    it('returns 404 for unsupported endpoints instead of a false success', async () => {
        await expect(axiosInstance.get('/unknown-demo-endpoint', demoConfig))
            .rejects.toMatchObject({response: {status: 404}});
    });
});
