import {beforeEach, describe, expect, it, vi} from 'vitest';
import {axiosInstance} from '../src/api/api';
import demoAdapter from '../src/mocks/demoAdapter';
import {DEMO_STORAGE_KEY} from '../src/mocks/demoData';

const demoConfig = {adapter: demoAdapter};

describe('Demo API history and export', () => {
    beforeEach(async () => {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        await axiosInstance.post('/reset-database', {}, demoConfig);
    });

    it('serves seeded product images for the GitHub Pages demo catalog', async () => {
        const products = await axiosInstance.get('/get_all_products/', demoConfig);
        expect(products.data[0].images).toEqual(expect.arrayContaining([
            expect.objectContaining({
                file_name: 'candle.svg',
                url: '/demo-images/candle.svg'
            })
        ]));

        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            blob: async () => new Blob(['<svg/>'], {type: 'image/svg+xml'}),
            headers: new Headers({'content-type': 'image/svg+xml'})
        });
        vi.stubGlobal('fetch', fetchMock);

        try {
            const image = await axiosInstance.get(products.data[0].images[0].url, {
                ...demoConfig,
                responseType: 'blob'
            });

            expect(image.data).toBeInstanceOf(Blob);
            expect(image.data.type).toBe('image/svg+xml');
            expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/demo-images/candle.svg'));
        } finally {
            vi.unstubAllGlobals();
        }
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

    it('releases linked gift set reservations atomically during inventory', async () => {
        const result = await axiosInstance.post('/product/1/inventory', {
            actual_quantity: 10,
            reason: 'Перевірка залишку'
        }, demoConfig);

        const product = await axiosInstance.get('/product/1', demoConfig);
        const packaging = await axiosInstance.get('/packaging/get_all_packaging_materials', demoConfig);
        const giftSets = await axiosInstance.get('/get_all_gift_sets', demoConfig);
        const history = await axiosInstance.get('/product/1/history', demoConfig);

        expect(result.data).toMatchObject({
            quantity_before: 26,
            quantity_after: 10,
            change_amount: -16,
            deleted_gift_sets: [1],
            reserved_quantity: 0
        });
        expect(product.data.available_quantity).toBe(10);
        expect(packaging.data[0].available_quantity).toBe(43);
        expect(packaging.data[0].reserved_quantity).toBe(0);
        expect(giftSets.data.map((item: {id: number}) => item.id)).toEqual([2]);
        expect(history.data.stock_history[0]).toMatchObject({change_type: 'inventory', change_amount: -16});
    });

    it('sells a seeded gift set using its existing product and packaging reservations', async () => {
        const sale = await axiosInstance.post('/sell_gift_set/1', {
            customer_id: 1,
            selling_price: 290
        }, demoConfig);

        const product = await axiosInstance.get('/product/1', demoConfig);
        const packaging = await axiosInstance.get('/packaging/get_all_packaging_materials', demoConfig);

        expect(sale.data.sales_record.gift_set_id).toBe(1);
        expect(product.data.reserved_quantity).toBe(1);
        expect(product.data.sold_quantity).toBe(5);
        expect(packaging.data[0].reserved_quantity).toBe(0);
        expect(packaging.data[0].sold_quantity).toBe(1);
    });

    it('does not partially reserve stock when gift set creation fails', async () => {
        await expect(axiosInstance.post('/create_gift_set', {
            name: 'Invalid demo set',
            description: '',
            gift_selling_price: 100,
            items: [
                {item_type: 'product', item_id: 1, quantity: 1},
                {item_type: 'packaging', item_id: 1, quantity: 1000}
            ]
        }, demoConfig)).rejects.toMatchObject({response: {status: 400}});

        const response = await axiosInstance.get('/product/1', demoConfig);
        expect(response.data.available_quantity).toBe(24);
        expect(response.data.reserved_quantity).toBe(2);
    });

    it('does not release existing reservations when gift set update validation fails', async () => {
        const created = await axiosInstance.post('/create_gift_set', {
            name: 'Temporary demo set',
            description: '',
            gift_selling_price: 100,
            items: [{item_type: 'product', item_id: 1, quantity: 1}]
        }, demoConfig);

        await expect(axiosInstance.put(`/update_gift_set/${created.data.id}`, {
            items: [{type: 'product', product_id: 1, quantity: 1000}]
        }, demoConfig)).rejects.toMatchObject({response: {status: 400}});

        const response = await axiosInstance.get('/product/1', demoConfig);
        expect(response.data.available_quantity).toBe(23);
        expect(response.data.reserved_quantity).toBe(3);
    });

    it('returns an Excel-compatible workbook blob for product export', async () => {
        const response = await axiosInstance.post('/export-products-excel', {
            product_ids: [1, 2]
        }, {...demoConfig, responseType: 'blob'});

        expect(response.data).toBeInstanceOf(Blob);
        expect(response.data.type).toBe('application/vnd.ms-excel');
        expect(response.data.size).toBeGreaterThan(0);
    });

    it('does not silently delete historical records in demo mode', async () => {
        await expect(axiosInstance.delete('/delete-history/1/purchase/1', demoConfig))
            .rejects.toMatchObject({response: {status: 409}});
        await expect(axiosInstance.delete('/product/1', demoConfig))
            .rejects.toMatchObject({response: {status: 409}});
        await expect(axiosInstance.delete('/delete_all_products', demoConfig))
            .rejects.toMatchObject({response: {status: 409}});
        await expect(axiosInstance.delete('/delete_all_materials', demoConfig))
            .rejects.toMatchObject({response: {status: 409}});
    });

    it('returns 404 for unsupported endpoints instead of a false success', async () => {
        await expect(axiosInstance.get('/unknown-demo-endpoint', demoConfig))
            .rejects.toMatchObject({response: {status: 404}});
    });
});
