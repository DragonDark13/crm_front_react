import type {AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {AxiosError, AxiosHeaders} from 'axios';
import {createInitialDemoDatabase, DEMO_STORAGE_KEY, type DemoDatabase} from './demoData';

const readDatabase = (): DemoDatabase => {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (!stored) return createInitialDemoDatabase();

        const parsed = JSON.parse(stored) as Partial<DemoDatabase>;
        const defaults = createInitialDemoDatabase();
        const products = Array.isArray(parsed.products) ? parsed.products : defaults.products;
        const packagingMaterials = Array.isArray(parsed.packagingMaterials) ? parsed.packagingMaterials : defaults.packagingMaterials;
        const purchases = (Array.isArray(parsed.purchases) ? parsed.purchases : defaults.purchases).map(item => {
            if (item.product_id === undefined && item.type === 'Product') {
                const matches = products.filter(product => product.name === item.name);
                if (matches.length === 1) return {...item, product_id: matches[0].id};
            }
            if (item.material_id === undefined && item.type === 'Packaging') {
                const matches = packagingMaterials.filter(material => material.name === item.name);
                if (matches.length === 1) return {...item, material_id: matches[0].id};
            }
            return item;
        });
        const sales = Array.isArray(parsed.sales) ? parsed.sales : defaults.sales;
        const returns = Array.isArray(parsed.returns) ? parsed.returns : defaults.returns;
        const productStockHistory = Array.isArray(parsed.productStockHistory)
            ? parsed.productStockHistory
            : [
                ...purchases.filter(item => item.type === 'Product' && Number(item.product_id) > 0).map((item, index) => ({
                    id: index + 1, product_id: Number(item.product_id), timestamp: `${item.date} 09:00:00`,
                    change_type: 'purchase', change_amount: Number(item.quantity || 0),
                    quantity_before: null, quantity_after: null, reason: 'Міграція демонстраційної історії'
                })),
                ...sales.map((item, index) => ({
                    id: purchases.length + index + 1, product_id: Number(item.product_id),
                    timestamp: `${item.sale_date} 12:00:00`, change_type: 'sale',
                    change_amount: -Number(item.quantity_sold || 0), quantity_before: null,
                    quantity_after: null, reason: null
                })),
                ...returns.map((item, index) => ({
                    id: purchases.length + sales.length + index + 1, product_id: Number(item.product_id),
                    timestamp: String(item.return_date), change_type: 'return',
                    change_amount: Number(item.quantity_returned || 0), quantity_before: null,
                    quantity_after: null, reason: String(item.return_reason || '')
                }))
            ];
        const productAuditHistory = Array.isArray(parsed.productAuditHistory)
            ? parsed.productAuditHistory
            : [
                ...purchases.filter(item => item.type === 'Product' && Number(item.product_id) > 0).map((item, index) => ({
                    id: index + 1, product_id: Number(item.product_id), changed_by_id: null,
                    changed_by_username: 'demo.manager', action: 'purchase', field_name: 'available_quantity',
                    old_value: null, new_value: String(item.quantity || 0),
                    reason: 'Міграція демонстраційної історії', changed_at: `${item.date} 09:00:00`
                })),
                ...sales.map((item, index) => ({
                    id: purchases.length + index + 1, product_id: Number(item.product_id), changed_by_id: null,
                    changed_by_username: 'demo.manager', action: 'sale', field_name: 'sold_quantity',
                    old_value: null, new_value: String(item.quantity_sold || 0), reason: null,
                    changed_at: `${item.sale_date} 12:00:00`
                })),
                ...returns.map((item, index) => ({
                    id: purchases.length + sales.length + index + 1, product_id: Number(item.product_id), changed_by_id: null,
                    changed_by_username: 'demo.manager', action: 'return', field_name: 'available_quantity',
                    old_value: null, new_value: String(item.quantity_returned || 0),
                    reason: String(item.return_reason || ''), changed_at: String(item.return_date)
                }))
            ];
        const packagingStockHistory = Array.isArray(parsed.packagingStockHistory)
            ? parsed.packagingStockHistory
            : purchases.filter(item => item.type === 'Packaging' && Number(item.material_id) > 0).map((item, index) => ({
                id: index + 1, material_id: Number(item.material_id), change_amount: Number(item.quantity || 0),
                change_type: 'purchase', timestamp: `${item.date} 09:00:00`
            }));
        return {
            ...defaults,
            ...parsed,
            products,
            packagingMaterials,
            purchases,
            sales,
            returns,
            productStockHistory,
            productAuditHistory,
            packagingStockHistory,
            packagingSalesHistory: Array.isArray(parsed.packagingSalesHistory)
                ? parsed.packagingSalesHistory
                : sales.filter(item => Number(item.packaging_material_id) > 0).map((item, index) => ({
                    id: index + 1, sale_id: Number(item.id), packaging_material_id: Number(item.packaging_material_id),
                    packaging_quantity: Number(item.packaging_quantity || 0),
                    total_packaging_cost: Number(item.total_packaging_cost || 0), sale_date: String(item.sale_date)
                }))
        };
    } catch {
        return createInitialDemoDatabase();
    }
};

let database = readDatabase();

const persist = () => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(database));
};

const nextId = (items: Record<string, unknown>[]) =>
    Math.max(0, ...items.map(item => Number(item.id) || 0)) + 1;

const response = (
    config: InternalAxiosRequestConfig,
    data: unknown,
    status = 200,
    contentType = 'application/json'
): AxiosResponse | Promise<never> => {
    const result: AxiosResponse = {
        data,
        status,
        statusText: status >= 400 ? 'Error' : 'OK',
        headers: new AxiosHeaders({'content-type': contentType}),
        config
    };

    if (status >= 400) {
        return Promise.reject(new AxiosError(
            `Request failed with status code ${status}`,
            undefined,
            config,
            undefined,
            result
        ));
    }

    return result;
};

const currentTimestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const addProductStockHistory = (
    productId: number,
    changeType: string,
    changeAmount: number,
    quantityBefore: number | null,
    quantityAfter: number | null,
    reason: string | null = null
) => {
    database.productStockHistory.push({
        id: nextId(database.productStockHistory),
        product_id: productId,
        timestamp: currentTimestamp(),
        change_type: changeType,
        change_amount: changeAmount,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        reason
    });
};

const addProductAuditHistory = (
    productId: number,
    action: string,
    fieldName: string,
    oldValue: unknown,
    newValue: unknown,
    reason: string | null = null
) => {
    database.productAuditHistory.push({
        id: nextId(database.productAuditHistory),
        product_id: productId,
        changed_by_id: null,
        changed_by_username: 'demo.manager',
        action,
        field_name: fieldName,
        old_value: oldValue === null || oldValue === undefined ? null : String(oldValue),
        new_value: newValue === null || newValue === undefined ? null : String(newValue),
        reason,
        changed_at: currentTimestamp()
    });
};

const addPackagingStockHistory = (materialId: number, changeAmount: number, changeType: string) => {
    database.packagingStockHistory.push({
        id: nextId(database.packagingStockHistory),
        material_id: materialId,
        change_amount: changeAmount,
        change_type: changeType,
        timestamp: currentTimestamp()
    });
};

const escapeXml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildProductExportXml = (products: Record<string, unknown>[]) => {
    const headers = [
        'Назва товару', 'Постачальник', 'Категорії', 'Загальна кількість',
        'Доступна кількість', 'Продана кількість', 'Ціна закупівлі за одиницю',
        'Ціна продажу за одиницю', 'Дата створення'
    ];
    const rows = products.map(product => {
        const supplier = product.supplier as Record<string, unknown> | null;
        const categoryIds = Array.isArray(product.category_ids) ? product.category_ids as number[] : [];
        const categories = database.categories
            .filter(category => categoryIds.includes(Number(category.id)))
            .map(category => category.name)
            .join(', ');
        return [
            product.name,
            supplier?.name || 'Н/Д',
            categories,
            product.total_quantity,
            product.available_quantity,
            product.sold_quantity,
            product.purchase_price_per_item,
            product.selling_price_per_item,
            String(product.created_date || '').slice(0, 10)
        ];
    });
    const rowXml = (values: unknown[]) => `<Row>${values.map(value => {
        const numeric = typeof value === 'number' && Number.isFinite(value);
        return `<Cell><Data ss:Type="${numeric ? 'Number' : 'String'}">${escapeXml(value)}</Data></Cell>`;
    }).join('')}</Row>`;

    return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Products"><Table>${rowXml(headers)}${rows.map(rowXml).join('')}</Table></Worksheet>
</Workbook>`;
};

const makeProductResponse = (product: Record<string, unknown>) => ({
    id: product.id,
    name: product.name,
    supplier_id: (product.supplier as Record<string, unknown> | null)?.id ?? null,
    total_quantity: product.total_quantity,
    available_quantity: product.available_quantity,
    reserved_quantity: product.reserved_quantity ?? 0,
    sold_quantity: product.sold_quantity,
    purchase_total_price: product.purchase_total_price,
    purchase_price_per_item: product.purchase_price_per_item,
    selling_total_price: product.selling_total_price,
    selling_price_per_item: product.selling_price_per_item,
    created_date: product.created_date,
    article: product.article,
    product_description: product.product_description
});

const adapter: AxiosAdapter = async config => {
    const method = (config.method || 'get').toLowerCase();
    const url = (config.url || '').split('?')[0].replace(/^https?:\/\/[^/]+/, '');
    const path = url.replace(/^\/api/, '');
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') as Record<string, unknown> : (config.data || {}) as Record<string, unknown>;
    const idMatch = path.match(/\/(\d+)(?:\/|$)/);
    const id = idMatch ? Number(idMatch[1]) : 0;
    let data: unknown;
    let status = 200;

    if (method === 'get' && path === '/me') {
        data = {roles: ['manager'], username: 'demo.manager'};
    } else if (method === 'post' && path === '/login') {
        data = {token: 'github-pages-demo-token', message: 'Демо-вхід успішний'};
    } else if (method === 'post' && path === '/logout') {
        data = {message: 'Вихід із демо-режиму'};
    } else if (method === 'get' && path === '/get_all_products/') {
        data = database.products;
    } else if (method === 'get' && path === '/suppliers/get_suppliers_list') {
        data = database.suppliers.filter(item => item.type === 'product');
    } else if (method === 'get' && path === '/get_all_packaging_suppliers') {
        data = database.packagingSuppliers;
    } else if (method === 'get' && path === '/categories/get_all_categories') {
        data = database.categories;
    } else if (method === 'get' && path === '/customers/get_all_customers') {
        data = database.customers;
    } else if (method === 'get' && path === '/packaging/get_all_packaging_materials') {
        data = database.packagingMaterials;
    } else if (method === 'get' && path === '/investments/get_all_investments') {
        data = database.investments;
    } else if (method === 'get' && path === '/get_all_gift_sets') {
        data = database.giftSets.filter(item => item.is_sold !== true);
    } else if (method === 'get' && path === '/get_all_purchase_history') {
        data = database.purchases;
    } else if (method === 'get' && path === '/get_all_sales_history') {
        data = database.sales;
    } else if (method === 'get' && path === '/get_all_gift_set_sales_history') {
        data = database.giftSetSales || [];
    } else if (method === 'get' && path === '/returns') {
        data = database.returns;
    } else if (method === 'get' && path === '/financial-journal') {
        data = [
            ...database.purchases.map(item => ({id: `product-purchase-${item.id}`, source_id: item.id, date: item.date, direction: 'expense', type: item.type === 'Packaging' ? 'Закупівля пакування' : 'Закупівля товару', description: item.name, counterparty: item.supplier_name || '', amount: Number(item.total_price || 0)})),
            ...database.investments.map(item => ({id: `other-expense-${item.id}`, source_id: item.id, date: item.date, direction: 'expense', type: 'Інші витрати', description: item.type_name, counterparty: item.supplier || '', amount: Number(item.cost || 0)})),
            ...database.sales.map(item => ({id: `product-sale-${item.id}`, source_id: item.id, date: item.sale_date, direction: 'income', type: 'Продаж товару', description: item.product_name, counterparty: item.customer_name || '', amount: Number(item.selling_total_price || 0)})),
            ...database.returns.map(item => ({id: `customer-return-${item.id}`, source_id: item.id, date: item.return_date, direction: 'expense', type: 'Повернення клієнту', description: item.product_name, counterparty: item.customer_name || '', amount: Number(item.return_amount || 0)})),
            ...(database.giftSetSales || []).map(item => ({id: `gift-set-sale-${item.id}`, source_id: item.id, date: item.sold_at, direction: 'income', type: 'Продаж гіфтбоксу', description: database.giftSets.find(gift => gift.id === item.gift_set_id)?.name || 'Гіфтбокс', counterparty: item.customer_name || '', amount: Number(item.sold_price || 0)}))
        ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    } else if (method === 'get' && path === '/statistics/overview') {
        const params = config.params as Record<string, unknown> | undefined;
        const today = new Date().toISOString().slice(0, 10);
        const startDate = String(params?.start_date || `${today.slice(0, 7)}-01`);
        const endDate = String(params?.end_date || today);
        const inPeriod = (value: unknown) => {
            const date = String(value || '').slice(0, 10);
            return date >= startDate && date <= endDate;
        };
        const sales = database.sales.filter(item => inPeriod(item.sale_date));
        const giftSetSales = (database.giftSetSales || []).filter(item => inPeriod(item.sold_at));
        const returns = database.returns.filter(item => inPeriod(item.return_date));
        const purchases = database.purchases.filter(item => inPeriod(item.date));
        const investments = database.investments.filter(item => inPeriod(item.date));
        const salesById = new Map(sales.map(item => [Number(item.id), item]));
        const months = new Map<string, {
            month: string; product_sales: number; gift_set_sales: number; returns: number;
            product_gross_profit: number; purchase_expenses: number; other_expenses: number;
        }>();
        const monthFor = (value: unknown) => {
            const month = String(value || '').slice(0, 7);
            const current = months.get(month) || {
                month, product_sales: 0, gift_set_sales: 0, returns: 0,
                product_gross_profit: 0, purchase_expenses: 0, other_expenses: 0
            };
            months.set(month, current);
            return current;
        };
        const top = new Map<number, {
            product_id: number; name: string; sold_quantity: number; returned_quantity: number;
            sales: number; refunds: number; gross_profit: number;
        }>();
        let productSales = 0;
        let giftSetRevenue = 0;
        let refunds = 0;
        let soldQuantity = 0;
        let returnedQuantity = 0;
        sales.forEach(sale => {
            const amount = Number(sale.selling_total_price || 0);
            const quantity = Number(sale.quantity_sold || 0);
            const productId = Number(sale.product_id);
            const product = database.products.find(item => Number(item.id) === productId);
            productSales += amount;
            soldQuantity += quantity;
            const month = monthFor(sale.sale_date);
            month.product_sales += amount;
            month.product_gross_profit += Number(sale.profit || 0);
            const item = top.get(productId) || {
                product_id: productId, name: String(sale.product_name || product?.name || 'Товар'),
                sold_quantity: 0, returned_quantity: 0, sales: 0, refunds: 0, gross_profit: 0
            };
            item.sold_quantity += quantity;
            item.sales += amount;
            item.gross_profit += Number(sale.profit || 0);
            top.set(productId, item);
        });
        giftSetSales.forEach(sale => {
            const amount = Number(sale.sold_price || 0);
            giftSetRevenue += amount;
            monthFor(sale.sold_at).gift_set_sales += amount;
        });
        returns.forEach(returnRecord => {
            const amount = Number(returnRecord.return_amount
                ?? (Number(salesById.get(Number(returnRecord.sale_id))?.selling_price_per_item || 0) * Number(returnRecord.quantity_returned || 0)));
            const quantity = Number(returnRecord.quantity_returned || 0);
            refunds += amount;
            returnedQuantity += quantity;
            monthFor(returnRecord.return_date).returns += amount;
            const sale = salesById.get(Number(returnRecord.sale_id));
            if (sale) {
                const productId = Number(sale.product_id);
                const item = top.get(productId);
                if (item) {
                    const saleQuantity = Number(sale.quantity_sold || 0);
                    const productMargin = Number(sale.profit || 0) + Number(sale.total_packaging_cost || 0);
                    const returnedMargin = saleQuantity > 0 ? productMargin * quantity / saleQuantity : 0;
                    item.returned_quantity += quantity;
                    item.refunds += amount;
                    item.gross_profit -= returnedMargin;
                    monthFor(returnRecord.return_date).product_gross_profit -= returnedMargin;
                }
            }
        });
        let purchaseExpenses = 0;
        purchases.forEach(purchase => {
            const amount = Number(purchase.total_price || 0);
            purchaseExpenses += amount;
            monthFor(purchase.date).purchase_expenses += amount;
        });
        let otherExpenses = 0;
        investments.forEach(expense => {
            const amount = Number(expense.cost || 0);
            otherExpenses += amount;
            monthFor(expense.date).other_expenses += amount;
        });
        const monthly = [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).map(item => ({
            ...item,
            gross_sales: item.product_sales + item.gift_set_sales,
            net_sales: item.product_sales + item.gift_set_sales - item.returns,
            total_expenses: item.purchase_expenses + item.other_expenses
        }));
        const restock = [
            ...database.products.filter(item => Number(item.reorder_level || 0) > 0 && Number(item.available_quantity || 0) <= Number(item.reorder_level || 0)).map(item => ({
                id: Number(item.id), name: String(item.name), type: 'product',
                available_quantity: Number(item.available_quantity || 0),
                reorder_level: Number(item.reorder_level || 0), unit: String(item.unit_of_measure || 'од.')
            })),
            ...database.packagingMaterials.filter(item => Number(item.reorder_level || 0) > 0 && Number(item.available_quantity || 0) <= Number(item.reorder_level || 0)).map(item => ({
                id: Number(item.id), name: String(item.name), type: 'packaging',
                available_quantity: Number(item.available_quantity || 0),
                reorder_level: Number(item.reorder_level || 0), unit: 'од.'
            }))
        ].sort((a, b) => a.available_quantity / a.reorder_level - b.available_quantity / b.reorder_level);
        const topProducts = [...top.values()].map(item => ({
            ...item,
            net_quantity: item.sold_quantity - item.returned_quantity,
            net_sales: item.sales - item.refunds
        })).sort((a, b) => b.net_quantity - a.net_quantity || b.net_sales - a.net_sales).slice(0, 10);
        data = {
            period: {start_date: startDate, end_date: endDate},
            summary: {
                product_sales: productSales,
                gift_set_sales: giftSetRevenue,
                gross_sales: productSales + giftSetRevenue,
                returns: refunds,
                net_sales: productSales + giftSetRevenue - refunds,
                product_gross_profit: monthly.reduce((sum, item) => sum + item.product_gross_profit, 0),
                sold_quantity: soldQuantity,
                returned_quantity: returnedQuantity,
                purchase_expenses: purchaseExpenses,
                other_expenses: otherExpenses,
                total_expenses: purchaseExpenses + otherExpenses,
                restock_count: restock.length
            },
            monthly,
            top_products: topProducts,
            restock,
            profit_scope_note: 'Валовий прибуток охоплює звичайні товарні продажі. Виручка гіфтбоксів включена в продажі, але їхній прибуток не розраховується, оскільки історія не зберігає собівартість компонентів на момент продажу.'
        };
    } else if (method === 'get' && path.startsWith('/product/') && path.endsWith('/history')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        data = {
            stock_history: database.productStockHistory
                .filter(item => Number(item.product_id) === id)
                .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
                .map(item => ({...item})),
            purchase_history: database.purchases
                .filter(item => item.type === 'Product' && Number(item.product_id) === id)
                .map(item => {
                    const supplier = database.suppliers.find(value => value.id === Number(item.supplier_id));
                    return {
                        id: item.id,
                        product_id: id,
                        supplier_id: item.supplier_id ?? null,
                        purchase_price_per_item: Number(item.price_per_item || 0),
                        purchase_total_price: Number(item.total_price || 0),
                        purchase_date: item.date,
                        quantity_purchase: Number(item.quantity || 0),
                        supplier: supplier ? {id: supplier.id, name: supplier.name, is_active: supplier.is_active !== false} : null
                    };
                }),
            sale_history: database.sales.filter(item => Number(item.product_id) === id).map(item => {
                const customer = database.customers.find(value => value.id === Number(item.customer_id));
                return {
                    id: item.id,
                    product_id: id,
                    customer_id: item.customer_id,
                    quantity_sold: item.quantity_sold,
                    selling_price_per_item: item.selling_price_per_item,
                    selling_total_price: item.selling_total_price,
                    sale_date: item.sale_date,
                    profit: item.profit || 0,
                    packaging_material_id: item.packaging_material_id ?? null,
                    packaging_quantity: item.packaging_quantity ?? null,
                    total_packaging_cost: item.total_packaging_cost ?? null,
                    customer: customer ? {id: customer.id, name: customer.name} : {id: Number(item.customer_id) || 0, name: String(item.customer_name || 'Гість')}
                };
            }),
            audit_history: database.productAuditHistory
                .filter(item => Number(item.product_id) === id)
                .sort((a, b) => String(b.changed_at).localeCompare(String(a.changed_at)))
                .map(item => ({...item}))
        };
    } else if (method === 'get' && path.startsWith('/product/')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        data = product;
    } else if (method === 'get' && path.startsWith('/customers_details/')) {
        const customer = database.customers.find(item => item.id === id);
        if (!customer) return response(config, {error: 'Customer not found'}, 404);
        data = {...customer, sales: database.sales.filter(item => Number(item.customer_id) === id)};
    } else if (method === 'get' && path.startsWith('/supplier/') && path.endsWith('/purchase-history')) {
        const supplier = database.suppliers.find(item => item.id === id);
        if (!supplier) return response(config, {error: 'Supplier not found'}, 404);
        data = {supplier: supplier.name, purchase_history: database.purchases.filter(item => Number(item.supplier_id) === id), products: database.products.filter(item => (item.supplier as Record<string, unknown> | null)?.id === id)};
    } else if (method === 'get' && path.startsWith('/supplier/') && path.endsWith('/products')) {
        const supplier = database.suppliers.find(item => item.id === id);
        if (!supplier) return response(config, {error: 'Supplier not found'}, 404);
        data = {supplier: supplier.name, products: database.products.filter(item => (item.supplier as Record<string, unknown> | null)?.id === id).map(item => ({id: item.id, name: item.name}))};
    } else if (method === 'post' && path === '/add_new_product') {
        const supplier = database.suppliers.find(item => item.id === Number(body.supplier_id)) || null;
        const quantity = Number(body.available_quantity ?? body.total_quantity ?? 0);
        const product = {...body, id: nextId(database.products), supplier, available_quantity: quantity, total_quantity: quantity, reserved_quantity: 0, sold_quantity: 0};
        database.products.push(product);
        const purchase = {
            id: nextId(database.purchases),
            product_id: product.id,
            name: String(body.name || ''),
            type: 'Product',
            date: String(body.created_date || new Date().toISOString().slice(0, 10)),
            categories: Array.isArray(body.category_ids) ? body.category_ids : [],
            quantity,
            price_per_item: Number(body.purchase_price_per_item || 0),
            total_price: Number(body.purchase_total_price || 0),
            supplier_id: supplier?.id ?? null,
            supplier_name: supplier?.name || '',
            supplier_is_active: supplier?.is_active !== false
        };
        database.purchases.push(purchase);
        addProductStockHistory(Number(product.id), 'create', quantity, 0, quantity);
        addProductAuditHistory(Number(product.id), 'create', 'available_quantity', null, quantity);
        persist();
        data = makeProductResponse(product);
    } else if (method === 'put' && path.startsWith('/product/')) {
        const index = database.products.findIndex(item => item.id === id);
        if (index < 0) return response(config, {error: 'Product not found'}, 404);
        const product = database.products[index];
        const previousAvailable = Number(product.available_quantity || 0);
        const previousPurchasePrice = Number(product.purchase_price_per_item || 0);
        const previousSellingPrice = Number(product.selling_price_per_item || 0);
        database.products[index] = {
            ...product,
            ...body,
            supplier: body.supplier_id === undefined
                ? product.supplier
                : database.suppliers.find(item => item.id === Number(body.supplier_id)) || null
        };
        const updated = database.products[index];
        if (Number(updated.available_quantity || 0) !== previousAvailable) {
            addProductStockHistory(id, 'manual_edit', Number(updated.available_quantity || 0) - previousAvailable, previousAvailable, Number(updated.available_quantity || 0));
            addProductAuditHistory(id, 'manual_edit', 'available_quantity', previousAvailable, updated.available_quantity);
        }
        if (Number(updated.purchase_price_per_item || 0) !== previousPurchasePrice) {
            addProductAuditHistory(id, 'manual_edit', 'purchase_price_per_item', previousPurchasePrice, updated.purchase_price_per_item);
        }
        if (Number(updated.selling_price_per_item || 0) !== previousSellingPrice) {
            addProductAuditHistory(id, 'manual_edit', 'selling_price_per_item', previousSellingPrice, updated.selling_price_per_item);
        }
        persist();
        data = makeProductResponse(updated);
    } else if (method === 'delete' && path.startsWith('/product/')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        const hasHistory = database.productStockHistory.some(item => Number(item.product_id) === id)
            || database.productAuditHistory.some(item => Number(item.product_id) === id)
            || database.purchases.some(item => Number(item.product_id) === id)
            || database.sales.some(item => Number(item.product_id) === id)
            || database.returns.some(item => Number(item.product_id) === id)
            || database.giftSets.some(giftSet => (giftSet.products as Record<string, unknown>[] || []).some(item => Number(item.product_id) === id));
        if (hasHistory) return response(config, {error: 'Товар має історичні записи або використовується у наборі й не може бути видалений'}, 409);
        database.products = database.products.filter(item => item.id !== id);
        persist();
    } else if (method === 'post' && path === '/create_supplier') {
        const supplier = {...body, id: nextId(database.suppliers), is_active: true, type: 'product'};
        database.suppliers.push(supplier); persist(); data = {message: 'Постачальника додано', supplier_id: supplier.id};
    } else if (method === 'put' && path.startsWith('/supplier_edit/')) {
        database.suppliers = database.suppliers.map(item => item.id === id ? {...item, ...body} : item); persist();
    } else if (method === 'delete' && path.startsWith('/delete_supplier/')) {
        database.suppliers = database.suppliers.filter(item => item.id !== id); persist();
    } else if (method === 'post' && path === '/customer_create') {
        const customer = {...body, id: nextId(database.customers)}; database.customers.push(customer); persist(); data = {message: 'Клієнта додано', customer};
    } else if (method === 'put' && path.startsWith('/update_customers/')) {
        const customerIndex = database.customers.findIndex(item => item.id === id);
        if (customerIndex < 0) return response(config, {error: 'Customer not found'}, 404);
        database.customers[customerIndex] = {...database.customers[customerIndex], ...body};
        persist();
        data = database.customers[customerIndex];
    } else if (method === 'delete' && path.startsWith('/delete_customers/')) {
        if (!database.customers.some(item => item.id === id)) return response(config, {error: 'Customer not found'}, 404);
        if (database.sales.some(item => Number(item.customer_id) === id)) return response(config, {error: 'Customer has sales history and cannot be deleted'}, 409);
        database.customers = database.customers.filter(item => item.id !== id);
        persist();
    } else if (method === 'post' && path === '/add_new_category') {
        const category = {id: nextId(database.categories), name: String(body.name || '')}; database.categories.push(category); persist(); data = {message: 'Категорію додано', category};
    } else if (method === 'get' && path.startsWith('/materials/') && path.endsWith('/history')) {
        const material = database.packagingMaterials.find(item => item.id === id);
        if (!material) return response(config, {error: 'Packaging material not found'}, 404);
        data = {
            packaging_material_id: id,
            purchase_history: database.purchases
                .filter(item => item.type === 'Packaging' && Number(item.material_id) === id)
                .map(item => ({
                    id: item.id,
                    material_id: id,
                    supplier_id: item.supplier_id ?? null,
                    quantity_purchased: Number(item.quantity || 0),
                    purchase_price_per_unit: Number(item.price_per_item || 0),
                    purchase_total_price: Number(item.total_price || 0),
                    purchase_date: item.date
                })),
            sales_history: database.packagingSalesHistory
                .filter(item => Number(item.packaging_material_id) === id)
                .map(item => ({...item})),
            stock_history: database.packagingStockHistory
                .filter(item => Number(item.material_id) === id)
                .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
                .map(item => ({...item}))
        };
    } else if (method === 'get' && path.startsWith('/packaging-supplier/') && path.endsWith('/purchase-history')) {
        const supplier = database.packagingSuppliers.find(item => item.id === id);
        if (!supplier) return response(config, {error: 'Packaging supplier not found'}, 404);
        data = {supplier, purchase_history: database.purchases.filter(item => item.type === 'Packaging' && Number(item.supplier_id) === id).map(item => ({material: item.name, quantity_purchased: item.quantity, purchase_date: item.date, purchase_price_per_unit: item.price_per_item, purchase_total_price: item.total_price})), materials: database.packagingMaterials.filter(item => Number(item.packaging_material_supplier_id) === id).map(item => ({id: item.id, name: item.name}))};
    } else if (method === 'post' && path === '/add_new_packaging_suppliers') {
        const supplier = {...body, id: nextId(database.packagingSuppliers), is_active: true};
        database.packagingSuppliers.push(supplier); database.suppliers.push({...supplier, type: 'packaging'}); persist(); data = supplier;
    } else if (method === 'put' && path.startsWith('/packaging_supplier_edit/')) {
        if (!database.packagingSuppliers.some(item => item.id === id)) return response(config, {error: 'Packaging supplier not found'}, 404);
        database.packagingSuppliers = database.packagingSuppliers.map(item => item.id === id ? {...item, ...body} : item);
        database.suppliers = database.suppliers.map(item => item.id === id && item.type === 'packaging' ? {...item, ...body} : item);
        persist();
    } else if (method === 'delete' && path.startsWith('/delete_packaging_supplier/')) {
        if (!database.packagingSuppliers.some(item => item.id === id)) return response(config, {error: 'Packaging supplier not found'}, 404);
        if (database.packagingMaterials.some(item => Number(item.packaging_material_supplier_id) === id)) return response(config, {error: 'Supplier is linked to packaging materials'}, 409);
        database.packagingSuppliers = database.packagingSuppliers.filter(item => item.id !== id);
        database.suppliers = database.suppliers.filter(item => !(item.id === id && item.type === 'packaging'));
        persist();
    } else if (method === 'delete' && path === '/delete_all_materials') {
        const hasPackagingHistory = database.packagingStockHistory.length > 0
            || database.packagingSalesHistory.length > 0
            || database.purchases.some(item => item.type === 'Packaging')
            || database.giftSets.some(giftSet => (giftSet.packagings as Record<string, unknown>[] || []).length > 0);
        if (hasPackagingHistory) return response(config, {error: 'Пакування не можна масово видалити, поки існують історичні записи або посилання на набори'}, 409);
        database.packagingMaterials = [];
        persist();
    } else if (method === 'delete' && path === '/delete_all_products') {
        const hasHistory = database.productStockHistory.length > 0
            || database.productAuditHistory.length > 0
            || database.purchases.some(item => item.type === 'Product')
            || database.sales.length > 0
            || database.returns.length > 0
            || database.giftSets.some(giftSet => (giftSet.products as Record<string, unknown>[] || []).length > 0);
        if (hasHistory) return response(config, {error: 'Товари не можна масово видалити, поки існують історичні записи або посилання на набори'}, 409);
        database.products = [];
        persist();
    } else if (method === 'post' && path === '/update_packaging_status') {
        const material = database.packagingMaterials.find(item => item.id === Number(body.material_id));
        const quantityUsed = Number(body.quantity_used);
        if (!material) return response(config, {error: 'Packaging material not found'}, 404);
        if (!Number.isFinite(quantityUsed) || quantityUsed <= 0) return response(config, {error: 'Quantity used must be greater than zero'}, 400);
        if (Number(material.available_quantity) < quantityUsed) return response(config, {error: 'Insufficient quantity available'}, 400);
        material.available_quantity = Number(material.available_quantity) - quantityUsed;
        material.available_stock_cost = Number(material.available_stock_cost || 0) - quantityUsed * Number(material.purchase_price_per_unit || 0);
        if (material.available_quantity === 0) material.status = 'used';
        addPackagingStockHistory(Number(material.id), -quantityUsed, 'used');
        persist();
        data = {message: 'Залишок пакування оновлено', material};
    } else if (method === 'post' && path === '/purchase_current_packaging') {
        const material = database.packagingMaterials.find(item => item.id === Number(body.material_id));
        if (!material) return response(config, {error: 'Packaging material not found'}, 404);
        const quantity = Number(body.quantity || 0);
        const totalCost = Number(body.total_purchase_cost || 0);
        material.available_quantity = Number(material.available_quantity) + quantity;
        material.total_quantity = Number(material.total_quantity) + quantity;
        material.total_purchase_cost = Number(material.total_purchase_cost) + totalCost;
        material.available_stock_cost = Number(material.available_stock_cost || 0) + totalCost;
        material.purchase_price_per_unit = Number(body.purchase_price_per_unit || material.purchase_price_per_unit || 0);
        const supplier = database.packagingSuppliers.find(item => item.id === Number(body.supplier_id));
        const purchase = {
            id: nextId(database.purchases),
            material_id: material.id,
            name: material.name,
            type: 'Packaging',
            date: String(body.purchase_date || new Date().toISOString().slice(0, 10)),
            quantity,
            price_per_item: Number(body.purchase_price_per_unit || 0),
            total_price: totalCost,
            supplier_id: body.supplier_id ?? material.packaging_material_supplier_id ?? null,
            supplier_name: supplier?.name || (material.supplier as Record<string, unknown> | null)?.name || '',
            supplier_is_active: supplier?.is_active !== false
        };
        database.purchases.push(purchase);
        addPackagingStockHistory(Number(material.id), quantity, 'purchase');
        persist();
        data = {message: 'Пакування закуплено', material};
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/inventory')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        const actualQuantity = Number(body.actual_quantity);
        if (!Number.isInteger(actualQuantity) || actualQuantity < 0) return response(config, {error: 'actual_quantity must be a non-negative integer'}, 400);
        if (body.reason !== undefined && typeof body.reason !== 'string') return response(config, {error: 'reason must be a string'}, 400);

        const giftSetsToDelete = database.giftSets.filter(giftSet =>
            giftSet.is_sold !== true
            && (giftSet.products as Record<string, unknown>[] || []).some(item => Number(item.product_id) === id)
        );
        const giftSetIds = giftSetsToDelete.map(giftSet => Number(giftSet.id));
        if (database.giftSetSales.some(sale => giftSetIds.includes(Number(sale.gift_set_id)))) {
            return response(config, {error: 'An unsold gift set has sales history and cannot be safely removed'}, 409);
        }

        const productRequirements = new Map<number, number>();
        const packagingRequirements = new Map<number, number>();
        giftSetsToDelete.forEach(giftSet => {
            (giftSet.products as Record<string, unknown>[] || []).forEach(item => {
                const itemId = Number(item.product_id);
                productRequirements.set(itemId, (productRequirements.get(itemId) || 0) + Number(item.quantity || 0));
            });
            (giftSet.packagings as Record<string, unknown>[] || []).forEach(item => {
                const itemId = Number(item.packaging_id);
                packagingRequirements.set(itemId, (packagingRequirements.get(itemId) || 0) + Number(item.quantity || 0));
            });
        });

        for (const [productId, quantity] of productRequirements) {
            const relatedProduct = database.products.find(item => Number(item.id) === productId);
            if (!relatedProduct || quantity <= 0 || Number(relatedProduct.reserved_quantity || 0) < quantity) {
                return response(config, {error: `Reserved quantity is inconsistent for product ${productId}`}, 409);
            }
        }
        for (const [materialId, quantity] of packagingRequirements) {
            const material = database.packagingMaterials.find(item => Number(item.id) === materialId);
            if (!material || quantity <= 0 || Number(material.reserved_quantity || 0) < quantity) {
                return response(config, {error: `Reserved quantity is inconsistent for packaging ${materialId}`}, 409);
            }
        }

        const quantityBefore = Number(product.available_quantity || 0) + Number(product.reserved_quantity || 0);
        for (const giftSet of giftSetsToDelete) {
            (giftSet.products as Record<string, unknown>[] || []).forEach(item => {
                const relatedProduct = database.products.find(value => Number(value.id) === Number(item.product_id))!;
                relatedProduct.available_quantity = Number(relatedProduct.available_quantity || 0) + Number(item.quantity || 0);
                relatedProduct.reserved_quantity = Number(relatedProduct.reserved_quantity || 0) - Number(item.quantity || 0);
            });
            (giftSet.packagings as Record<string, unknown>[] || []).forEach(item => {
                const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id))!;
                material.available_quantity = Number(material.available_quantity || 0) + Number(item.quantity || 0);
                material.reserved_quantity = Number(material.reserved_quantity || 0) - Number(item.quantity || 0);
            });
        }

        product.available_quantity = actualQuantity;
        product.reserved_quantity = 0;
        database.giftSets = database.giftSets.filter(giftSet => !giftSetIds.includes(Number(giftSet.id)));
        const changeAmount = actualQuantity - quantityBefore;
        const reason = String(body.reason || '').trim() || null;
        addProductStockHistory(id, 'inventory', changeAmount, quantityBefore, actualQuantity, reason);
        addProductAuditHistory(id, 'inventory', 'available_quantity', quantityBefore, actualQuantity, reason);
        const stockHistory = database.productStockHistory[database.productStockHistory.length - 1];
        persist();
        data = {message: 'Інвентаризацію виконано', product_id: id, quantity_before: quantityBefore, quantity_after: actualQuantity, change_amount: changeAmount, deleted_gift_sets: giftSetIds, available_quantity: actualQuantity, reserved_quantity: 0, stock_history: stockHistory};
    } else if (method === 'delete' && path.startsWith('/delete-history/')) {
        return response(config, {
            error: 'Видалення історичних записів у демо-режимі вимкнено, щоб зберегти цілісність історії'
        }, 409);
    } else if (method === 'post' && path === '/reset-database') {
        database = createInitialDemoDatabase(); persist(); data = {message: 'Демо-дані відновлено'};
    } else if (method === 'post' && path === '/create_new_investments') {
        const investment = {...body, id: nextId(database.investments)}; database.investments.push(investment); persist();
    } else if (method === 'delete' && path.startsWith('/delete_investments/')) {
        database.investments = database.investments.filter(item => item.id !== id); persist();
    } else if (method === 'delete' && path === '/delete_all_investments') {
        database.investments = []; persist();
    } else if (method === 'post' && path === '/create_gift_set') {
        const items = Array.isArray(body.items) ? body.items as Record<string, unknown>[] : [];
        const requirements = new Map<string, {type: 'product' | 'packaging'; id: number; quantity: number}>();
        for (const item of items) {
            const type = item.item_type;
            const itemId = Number(item.item_id);
            const quantity = Number(item.quantity ?? 1);
            if ((type !== 'product' && type !== 'packaging') || !Number.isInteger(itemId) || itemId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
                return response(config, {error: 'Некоректний склад подарункового набору'}, 400);
            }
            const key = `${type}:${itemId}`;
            const current = requirements.get(key);
            requirements.set(key, {type, id: itemId, quantity: (current?.quantity || 0) + quantity});
        }
        for (const requirement of requirements.values()) {
            const resource = requirement.type === 'product'
                ? database.products.find(value => Number(value.id) === requirement.id)
                : database.packagingMaterials.find(value => Number(value.id) === requirement.id);
            if (!resource || Number(resource.available_quantity) < requirement.quantity) {
                return response(config, {error: requirement.type === 'product' ? 'Товар відсутній або недостатній залишок' : 'Пакування відсутнє або недостатній залишок'}, 400);
            }
        }

        let totalPrice = 0;
        const products: Record<string, unknown>[] = [];
        const packagings: Record<string, unknown>[] = [];
        for (const item of items) {
            const quantity = Number(item.quantity ?? 1);
            if (item.item_type === 'product') {
                const product = database.products.find(value => Number(value.id) === Number(item.item_id))!;
                product.available_quantity = Number(product.available_quantity) - quantity;
                product.reserved_quantity = Number(product.reserved_quantity || 0) + quantity;
                totalPrice += Number(product.purchase_price_per_item || 0) * quantity;
                products.push({product_id: product.id, name: product.name, quantity, price: product.purchase_price_per_item});
            } else {
                const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.item_id))!;
                material.available_quantity = Number(material.available_quantity) - quantity;
                material.reserved_quantity = Number(material.reserved_quantity || 0) + quantity;
                totalPrice += Number(material.purchase_price_per_unit || 0) * quantity;
                packagings.push({packaging_id: material.id, name: material.name, quantity, price: material.purchase_price_per_unit});
            }
        }
        const giftSet = {id: nextId(database.giftSets), name: body.name, description: body.description, gift_selling_price: Number(body.gift_selling_price || 0), total_price: totalPrice, products, packagings, is_sold: false};
        database.giftSets.push(giftSet);
        persist();
        data = {message: 'Gift set created successfully', id: giftSet.id};
    } else if (method === 'put' && path.startsWith('/update_gift_set/')) {
        const giftSet = database.giftSets.find(item => item.id === id);
        if (!giftSet) return response(config, {error: 'Gift set not found'}, 404);
        if (giftSet.is_sold === true) return response(config, {error: 'Sold gift sets cannot be edited'}, 409);

        const previousProducts = giftSet.products as Record<string, unknown>[] || [];
        const previousPackagings = giftSet.packagings as Record<string, unknown>[] || [];
        const releasedProducts = new Map<number, number>();
        const releasedPackagings = new Map<number, number>();
        previousProducts.forEach(item => releasedProducts.set(Number(item.product_id), (releasedProducts.get(Number(item.product_id)) || 0) + Number(item.quantity || 0)));
        previousPackagings.forEach(item => releasedPackagings.set(Number(item.packaging_id), (releasedPackagings.get(Number(item.packaging_id)) || 0) + Number(item.quantity || 0)));

        const items = Array.isArray(body.items) ? body.items as Record<string, unknown>[] : [];
        for (const item of previousProducts) {
            const product = database.products.find(value => Number(value.id) === Number(item.product_id));
            if (!product || Number(product.reserved_quantity || 0) < Number(item.quantity || 0)) {
                return response(config, {error: 'Поточний резерв товару не відповідає складу набору'}, 409);
            }
        }
        for (const item of previousPackagings) {
            const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id));
            if (!material || Number(material.reserved_quantity || 0) < Number(item.quantity || 0)) {
                return response(config, {error: 'Поточний резерв пакування не відповідає складу набору'}, 409);
            }
        }
        const requirements = new Map<string, {type: 'product' | 'packaging'; id: number; quantity: number}>();
        for (const item of items) {
            const type = item.type;
            const itemId = Number(type === 'product' ? item.product_id : item.packaging_id);
            const quantity = Number(item.quantity ?? 1);
            if ((type !== 'product' && type !== 'packaging') || !Number.isInteger(itemId) || itemId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
                return response(config, {error: 'Некоректний склад подарункового набору'}, 400);
            }
            const key = `${type}:${itemId}`;
            const current = requirements.get(key);
            requirements.set(key, {type, id: itemId, quantity: (current?.quantity || 0) + quantity});
        }
        for (const requirement of requirements.values()) {
            const resource = requirement.type === 'product'
                ? database.products.find(value => Number(value.id) === requirement.id)
                : database.packagingMaterials.find(value => Number(value.id) === requirement.id);
            const released = requirement.type === 'product'
                ? releasedProducts.get(requirement.id) || 0
                : releasedPackagings.get(requirement.id) || 0;
            if (!resource || Number(resource.available_quantity) + released < requirement.quantity) {
                return response(config, {error: requirement.type === 'product' ? 'Товар відсутній або недостатній залишок' : 'Пакування відсутнє або недостатній залишок'}, 400);
            }
        }

        previousProducts.forEach(item => {
            const product = database.products.find(value => Number(value.id) === Number(item.product_id));
            if (product) {
                product.available_quantity = Number(product.available_quantity) + Number(item.quantity || 0);
                product.reserved_quantity = Math.max(0, Number(product.reserved_quantity || 0) - Number(item.quantity || 0));
            }
        });
        previousPackagings.forEach(item => {
            const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id));
            if (material) {
                material.available_quantity = Number(material.available_quantity) + Number(item.quantity || 0);
                material.reserved_quantity = Math.max(0, Number(material.reserved_quantity || 0) - Number(item.quantity || 0));
            }
        });

        const products: Record<string, unknown>[] = [];
        const packagings: Record<string, unknown>[] = [];
        let totalPrice = 0;
        for (const item of items) {
            const quantity = Number(item.quantity ?? 1);
            if (item.type === 'product') {
                const product = database.products.find(value => Number(value.id) === Number(item.product_id))!;
                product.available_quantity = Number(product.available_quantity) - quantity;
                product.reserved_quantity = Number(product.reserved_quantity || 0) + quantity;
                totalPrice += Number(item.price ?? product.purchase_price_per_item ?? 0) * quantity;
                products.push({product_id: product.id, name: product.name, quantity, price: item.price ?? product.purchase_price_per_item});
            } else {
                const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id))!;
                material.available_quantity = Number(material.available_quantity) - quantity;
                material.reserved_quantity = Number(material.reserved_quantity || 0) + quantity;
                totalPrice += Number(material.purchase_price_per_unit || 0) * quantity;
                packagings.push({packaging_id: material.id, name: material.name, quantity, price: material.purchase_price_per_unit});
            }
        }
        Object.assign(giftSet, {name: body.name ?? giftSet.name, description: body.description ?? giftSet.description, gift_selling_price: body.gift_selling_price ?? giftSet.gift_selling_price, products, packagings, total_price: totalPrice});
        persist();
        data = {message: 'Gift set updated successfully', id};
    } else if (method === 'delete' && path.startsWith('/remove_gift_set/')) {
        const giftSet = database.giftSets.find(item => item.id === id);
        if (!giftSet) return response(config, {error: 'Gift set not found'}, 404);
        if (giftSet.is_sold === true) return response(config, {error: 'Sold gift sets cannot be removed'}, 409);
        const giftProducts = giftSet.products as Record<string, unknown>[] || [];
        const giftPackagings = giftSet.packagings as Record<string, unknown>[] || [];
        for (const item of giftProducts) {
            const product = database.products.find(value => Number(value.id) === Number(item.product_id));
            if (!product || Number(product.reserved_quantity || 0) < Number(item.quantity || 0)) {
                return response(config, {error: 'Резерв товару не відповідає складу набору'}, 409);
            }
        }
        for (const item of giftPackagings) {
            const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id));
            if (!material || Number(material.reserved_quantity || 0) < Number(item.quantity || 0)) {
                return response(config, {error: 'Резерв пакування не відповідає складу набору'}, 409);
            }
        }
        if (giftSet) {
            for (const item of giftProducts) {
                const product = database.products.find(value => value.id === Number(item.product_id));
                if (product) { product.available_quantity = Number(product.available_quantity) + Number(item.quantity || 0); product.reserved_quantity = Math.max(0, Number(product.reserved_quantity || 0) - Number(item.quantity || 0)); }
            }
            for (const item of giftPackagings) {
                const material = database.packagingMaterials.find(value => value.id === Number(item.packaging_id));
                if (material) { material.available_quantity = Number(material.available_quantity) + Number(item.quantity || 0); material.reserved_quantity = Math.max(0, Number(material.reserved_quantity || 0) - Number(item.quantity || 0)); }
            }
        }
        database.giftSets = database.giftSets.filter(item => item.id !== id); persist();
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/purchase')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        const quantity = Number(body.quantity || 0);
        const pricePerItem = Number(body.purchase_price_per_item || 0);
        const totalPrice = Number(body.purchase_total_price || 0);
        if (!Number.isInteger(quantity) || quantity <= 0 || pricePerItem <= 0 || totalPrice <= 0) return response(config, {error: 'Invalid purchase quantity or price'}, 400);
        const before = Number(product.available_quantity || 0);
        product.available_quantity = before + quantity;
        product.total_quantity = Number(product.total_quantity || 0) + quantity;
        product.purchase_total_price = Number(product.purchase_total_price || 0) + totalPrice;
        product.purchase_price_per_item = pricePerItem;
        const supplier = database.suppliers.find(item => item.id === Number(body.supplier_id));
        if (supplier) product.supplier = supplier;
        database.purchases.push({
            id: nextId(database.purchases),
            product_id: id,
            name: String(product.name || ''),
            type: 'Product',
            date: String(body.purchase_date || new Date().toISOString().slice(0, 10)),
            categories: product.category_ids || [],
            quantity,
            price_per_item: pricePerItem,
            total_price: totalPrice,
            supplier_id: supplier?.id ?? null,
            supplier_name: supplier?.name || '',
            supplier_is_active: supplier?.is_active !== false
        });
        addProductStockHistory(id, 'purchase', quantity, before, Number(product.available_quantity));
        addProductAuditHistory(id, 'purchase', 'available_quantity', before, product.available_quantity);
        addProductAuditHistory(id, 'purchase', 'purchase_price_per_item', null, pricePerItem);
        persist();
        data = {message: 'Purchase recorded successfully'};
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/sale')) {
        const product = database.products.find(item => item.id === id);
        const quantity = Number(body.quantity || 0);
        const customer = database.customers.find(item => item.id === Number(body.customer));
        const packagingId = Number(body.packaging_id) || null;
        const packagingQuantity = Number(body.packaging_quantity || 0);
        const material = packagingId ? database.packagingMaterials.find(item => item.id === packagingId) : null;
        if (!product) return response(config, {error: 'Product not found'}, 404);
        if (!Number.isInteger(quantity) || quantity <= 0) return response(config, {error: 'Quantity sold must be greater than zero'}, 400);
        if (Number(product.available_quantity) < quantity) return response(config, {error: 'Not enough quantity in stock'}, 400);
        if (!customer) return response(config, {error: 'Customer not found'}, 404);
        if (packagingId && !material) return response(config, {error: 'Packaging material not found'}, 404);
        if (material && Number(material.available_quantity) < packagingQuantity) return response(config, {error: 'Not enough packaging material available'}, 400);

        const before = Number(product.available_quantity || 0);
        const pricePerItem = Number(body.selling_price_per_item || 0);
        const totalPrice = Number(body.selling_total_price || 0);
        const totalPackagingCost = Number(body.total_packaging_cost || 0);
        product.available_quantity = before - quantity;
        product.sold_quantity = Number(product.sold_quantity || 0) + quantity;
        product.selling_quantity = Number(product.selling_quantity || 0) + quantity;
        product.selling_total_price = Number(product.selling_total_price || 0) + totalPrice;
        product.selling_price_per_item = pricePerItem;
        if (material) {
            material.available_quantity = Number(material.available_quantity) - packagingQuantity;
            material.available_stock_cost = Number(material.available_stock_cost || 0) - totalPackagingCost;
            addPackagingStockHistory(Number(material.id), -packagingQuantity, 'sale');
        }
        const sale = {
            id: nextId(database.sales),
            product_id: id,
            product_name: product.name,
            customer_id: customer.id,
            customer_name: customer.name,
            quantity_sold: quantity,
            selling_price_per_item: pricePerItem,
            selling_total_price: totalPrice,
            sale_date: String(body.sale_date || new Date().toISOString().slice(0, 10)),
            profit: (pricePerItem - Number(product.purchase_price_per_item || 0)) * quantity - totalPackagingCost,
            packaging_material_id: packagingId,
            packaging_quantity: packagingQuantity,
            total_packaging_cost: totalPackagingCost
        };
        database.sales.push(sale);
        if (material && packagingId) {
            database.packagingSalesHistory.push({
                id: nextId(database.packagingSalesHistory),
                sale_id: sale.id,
                packaging_material_id: packagingId,
                packaging_quantity: packagingQuantity,
                total_packaging_cost: totalPackagingCost,
                sale_date: sale.sale_date
            });
        }
        addProductStockHistory(id, 'sale', -quantity, before, Number(product.available_quantity));
        addProductAuditHistory(id, 'sale', 'available_quantity', before, product.available_quantity);
        addProductAuditHistory(id, 'sale', 'sold_quantity', Number(product.sold_quantity) - quantity, product.sold_quantity);
        persist();
    } else if (method === 'post' && path === '/packaging_materials/purchase') {
        const quantity = Number(body.quantity_purchased || 0);
        const material = {id: nextId(database.packagingMaterials), name: body.name, available_quantity: quantity, total_quantity: quantity, reorder_level: 5, packaging_material_supplier_id: Number(body.supplier_id), purchase_price_per_unit: Number(body.purchase_price_per_unit), total_purchase_cost: Number(body.total_purchase_cost), available_stock_cost: Number(body.total_purchase_cost), created_date: new Date().toISOString().slice(0, 10), supplier: database.packagingSuppliers.find(item => item.id === Number(body.supplier_id)) || null};
        database.packagingMaterials.push(material);
        const purchase = {id: nextId(database.purchases), material_id: material.id, name: material.name, type: 'Packaging', date: material.created_date, quantity, price_per_item: Number(body.purchase_price_per_unit), total_price: Number(body.total_purchase_cost), supplier_id: material.packaging_material_supplier_id, supplier_name: material.supplier?.name || '', supplier_is_active: material.supplier?.is_active !== false};
        database.purchases.push(purchase);
        addPackagingStockHistory(Number(material.id), quantity, 'purchase');
        persist();
    } else if (method === 'post' && path.startsWith('/sell_gift_set/')) {
        const giftSet = database.giftSets.find(item => item.id === id && item.is_sold !== true);
        const customer = database.customers.find(item => item.id === Number(body.customer_id));
        if (!giftSet) return response(config, {error: 'Gift set not found or already sold'}, 404);
        if (!customer) return response(config, {error: 'Customer not found'}, 404);
        if (giftSet && customer) {
            const products = giftSet.products as Record<string, unknown>[] || [];
            const packagings = giftSet.packagings as Record<string, unknown>[] || [];
            for (const item of products) {
                const product = database.products.find(value => Number(value.id) === Number(item.product_id));
                if (!product || Number(product.reserved_quantity || 0) < Number(item.quantity || 0)) {
                    return response(config, {error: 'Резерв товару не відповідає складу набору'}, 409);
                }
            }
            for (const item of packagings) {
                const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id));
                if (!material || Number(material.reserved_quantity || 0) < Number(item.quantity || 0)) {
                    return response(config, {error: 'Резерв пакування не відповідає складу набору'}, 409);
                }
            }
            products.forEach(item => {
                const product = database.products.find(value => Number(value.id) === Number(item.product_id))!;
                product.reserved_quantity = Number(product.reserved_quantity || 0) - Number(item.quantity || 0);
                product.sold_quantity = Number(product.sold_quantity || 0) + Number(item.quantity || 0);
            });
            packagings.forEach(item => {
                const material = database.packagingMaterials.find(value => Number(value.id) === Number(item.packaging_id))!;
                material.reserved_quantity = Number(material.reserved_quantity || 0) - Number(item.quantity || 0);
                material.sold_quantity = Number(material.sold_quantity || 0) + Number(item.quantity || 0);
            });
            giftSet.is_sold = true;
            const sale = {id: nextId(database.giftSetSales || []), gift_set_id: id, sold_at: new Date().toISOString(), sold_price: Number(body.selling_price || 0), quantity: 1, customer_name: customer.name, customer_id: customer.id, products, packagings};
            database.giftSetSales = [...(database.giftSetSales || []), sale];
            persist(); data = {message: 'Gift set sold successfully', sales_record: sale};
        } else return response(config, {error: 'Gift set or customer not found'}, 404);
    } else if (method === 'post' && path.startsWith('/sales/') && path.endsWith('/returns')) {
        const sale = database.sales.find(item => item.id === id);
        const product = sale ? database.products.find(item => item.id === sale.product_id) : undefined;
        const quantity = Number(body.quantity);
        const previousReturns = database.returns.filter(item => item.sale_id === id);
        const alreadyReturned = previousReturns.reduce((sum, item) => sum + Number(item.quantity_returned || 0), 0);
        const remaining = Number(sale?.quantity_sold || 0) - alreadyReturned;
        if (!sale || !product) return response(config, {error: 'Sale or product not found'}, 404);
        if (!Number.isInteger(quantity) || quantity <= 0) return response(config, {error: 'Quantity must be a positive integer'}, 400);
        if (quantity > remaining) return response(config, {error: `Return quantity exceeds the remaining quantity (${remaining})`}, 409);
        else {
            const refunded = previousReturns.reduce((sum, item) => sum + Number(item.return_amount || 0), 0);
            const remainingAmount = Number(sale.selling_total_price || 0) - refunded;
            const returnAmount = Number((quantity === remaining ? remainingAmount : remainingAmount * quantity / remaining).toFixed(2));
            const returned = {id: nextId(database.returns), sale_id: id, product_id: product.id, product_name: product.name, customer_id: sale.customer_id, customer_name: sale.customer_name, quantity_returned: quantity, return_amount: returnAmount, return_reason: String(body.reason || '').trim() || null, return_date: new Date().toISOString(), returned_by_username: 'demo.manager'};
            const before = Number(product.available_quantity || 0);
            product.available_quantity = before + quantity;
            product.sold_quantity = Math.max(0, Number(product.sold_quantity || 0) - quantity);
            product.selling_quantity = Math.max(0, Number(product.selling_quantity || 0) - quantity);
            product.selling_total_price = Math.max(0, Number(product.selling_total_price || 0) - returnAmount);
            database.returns.push(returned);
            addProductStockHistory(Number(product.id), 'return', quantity, before, Number(product.available_quantity), returned.return_reason);
            addProductAuditHistory(Number(product.id), 'return', 'available_quantity', before, product.available_quantity, returned.return_reason);
            persist();
            data = {message: 'Customer return recorded successfully', return: returned, available_quantity: product.available_quantity, remaining_return_quantity: remaining - quantity};
        }
    } else if (method === 'post' && path === '/export-products-excel') {
        const requestedIds = Array.isArray(body.product_ids) ? body.product_ids.map(Number) : [];
        if (!requestedIds.length) return response(config, {error: 'No product IDs provided'}, 400);
        const products = database.products.filter(product => requestedIds.includes(Number(product.id)));
        if (!products.length) return response(config, {error: 'No matching products found'}, 404);
        const workbook = new Blob([buildProductExportXml(products)], {type: 'application/vnd.ms-excel'});
        return response(config, workbook, 200, 'application/vnd.ms-excel');
    } else {
        data = {error: `Невідомий endpoint: ${method.toUpperCase()} ${path}`};
        status = 404;
    }

    return response(config, data, status);
};

export default adapter;
