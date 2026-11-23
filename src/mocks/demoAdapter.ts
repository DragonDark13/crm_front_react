import type {AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {AxiosHeaders} from 'axios';
import {createInitialDemoDatabase, DEMO_STORAGE_KEY, type DemoDatabase} from './demoData';

const readDatabase = (): DemoDatabase => {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (!stored) return createInitialDemoDatabase();

        const parsed = JSON.parse(stored) as Partial<DemoDatabase>;
        return {
            ...createInitialDemoDatabase(),
            ...parsed,
            productStockHistory: Array.isArray(parsed.productStockHistory) ? parsed.productStockHistory : [],
            productAuditHistory: Array.isArray(parsed.productAuditHistory) ? parsed.productAuditHistory : [],
            packagingStockHistory: Array.isArray(parsed.packagingStockHistory) ? parsed.packagingStockHistory : [],
            packagingSalesHistory: Array.isArray(parsed.packagingSalesHistory) ? parsed.packagingSalesHistory : []
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
): AxiosResponse => ({
    data,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: new AxiosHeaders({'content-type': contentType}),
    config
});

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
    } else if (method === 'get' && path.startsWith('/statistics/')) {
        const grouped = (records: Record<string, unknown>[], dateField: string) => {
            const totals = new Map<string, {year: number; month: number; amount: number; quantity: number}>();
            records.forEach(record => {
                const date = String(record[dateField] || '');
                const [yearText, monthText] = date.split('-');
                const year = Number(yearText);
                const month = Number(monthText);
                if (!year || !month) return;
                const key = `${year}-${month}`;
                const current = totals.get(key) || {year, month, amount: 0, quantity: 0};
                current.amount += Number(record.total_price ?? record.selling_total_price ?? 0);
                current.quantity += Number(record.quantity ?? record.quantity_sold ?? 0);
                totals.set(key, current);
            });
            return [...totals.values()].sort((a, b) => a.year - b.year || a.month - b.month);
        };
        if (path === '/statistics/sales/monthly') {
            data = grouped(database.sales, 'sale_date').map(item => ({year: item.year, month: item.month, total_sales: item.amount, total_quantity: item.quantity, total_profit: database.sales.filter(sale => String(sale.sale_date).startsWith(`${item.year}-${String(item.month).padStart(2, '0')}`)).reduce((sum, sale) => sum + Number(sale.profit || 0), 0)}));
        } else if (path === '/statistics/purchases/monthly') {
            data = grouped(database.purchases.filter(item => item.type === 'Product'), 'date').map(item => ({year: item.year, month: item.month, total_spent: item.amount, total_quantity: item.quantity, avg_price: item.quantity ? item.amount / item.quantity : 0}));
        } else if (path.endsWith('/top-products')) data = database.products.slice(0, 5).map(product => ({product_id: product.id, name: product.name, total_sold: product.sold_quantity, total_sales: product.selling_total_price}));
        else if (path.endsWith('/stock')) data = database.products.map(product => ({id: product.id, name: product.name, available_quantity: product.available_quantity, total_quantity: product.total_quantity}));
        else if (path.endsWith('/profit-expense')) {
            const sales = grouped(database.sales, 'sale_date');
            const purchases = grouped(database.purchases.filter(item => item.type === 'Product'), 'date');
            const keys = new Set([...sales, ...purchases].map(item => `${item.year}-${item.month}`));
            data = [...keys].sort().map(key => {
                const [year, month] = key.split('-').map(Number);
                const sale = sales.find(item => item.year === year && item.month === month);
                const purchase = purchases.find(item => item.year === year && item.month === month);
                return {year, month, sales: sale?.amount || 0, profit: database.sales.filter(item => String(item.sale_date).startsWith(key)).reduce((sum, item) => sum + Number(item.profit || 0), 0), expenses: (purchase?.amount || 0) + database.investments.filter(item => String(item.date).startsWith(key)).reduce((sum, item) => sum + Number(item.cost || 0), 0)};
            });
        } else if (path === '/statistics/customer-activity') {
            data = Array.from({length: 7}, (_, index) => ({day: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10), active_customers: new Set(database.sales.filter(sale => sale.sale_date === new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10)).map(sale => sale.customer_id)).size}));
        } else {
            data = {error: 'Невідомий endpoint статистики'};
            status = 404;
        }
    } else if (method === 'get' && path.startsWith('/product/') && path.endsWith('/history')) {
        const product = database.products.find(item => item.id === id);
        if (!product) return response(config, {error: 'Product not found'}, 404);
        data = {
            stock_history: database.productStockHistory
                .filter(item => Number(item.product_id) === id)
                .map(item => ({...item})),
            purchase_history: database.purchases
                .filter(item => item.type === 'Product' && (
                    Number(item.product_id) === id
                    || (item.product_id === undefined && item.name === product.name)
                ))
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
        data = database.products.find(item => item.id === id) || {};
    } else if (method === 'get' && path.startsWith('/customers_details/')) {
        const customer = database.customers.find(item => item.id === id);
        data = {...customer, sales: database.sales.filter(item => item.customer_id === id)};
    } else if (method === 'get' && path.startsWith('/supplier/') && path.endsWith('/purchase-history')) {
        const supplier = database.suppliers.find(item => item.id === id);
        data = {supplier: supplier?.name || '', purchase_history: database.purchases.filter(item => item.supplier_id === id), products: database.products.filter(item => (item.supplier as Record<string, unknown> | null)?.id === id)};
    } else if (method === 'get' && path.startsWith('/supplier/') && path.endsWith('/products')) {
        const supplier = database.suppliers.find(item => item.id === id);
        data = {supplier: supplier?.name || '', products: database.products.filter(item => (item.supplier as Record<string, unknown> | null)?.id === id).map(item => ({id: item.id, name: item.name}))};
    } else if (method === 'post' && path === '/add_new_product') {
        const supplier = database.suppliers.find(item => item.id === Number(body.supplier_id)) || null;
        const quantity = Number(body.available_quantity ?? body.total_quantity ?? 0);
        const product = {...body, id: nextId(database.products), supplier, available_quantity: quantity, total_quantity: quantity, reserved_quantity: 0, sold_quantity: 0};
        database.products.push(product);
        const purchase = {
            id: nextId(database.purchases),
            product_id: product.id,
            name: product.name,
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
        if (index >= 0) database.products[index] = {...database.products[index], ...body, supplier: database.suppliers.find(item => item.id === Number(body.supplier_id)) || null};
        persist(); data = makeProductResponse(database.products[index] || {});
    } else if (method === 'delete' && path.startsWith('/product/')) {
        database.products = database.products.filter(item => item.id !== id); persist();
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
        database.customers = database.customers.map(item => item.id === id ? {...item, ...body} : item); persist(); data = database.customers.find(item => item.id === id);
    } else if (method === 'delete' && path.startsWith('/delete_customers/')) {
        database.customers = database.customers.filter(item => item.id !== id); persist();
    } else if (method === 'post' && path === '/add_new_category') {
        const category = {id: nextId(database.categories), name: String(body.name || '')}; database.categories.push(category); persist(); data = {message: 'Категорію додано', category};
    } else if (method === 'get' && path.startsWith('/materials/') && path.endsWith('/history')) {
        const material = database.packagingMaterials.find(item => item.id === id);
        if (!material) return response(config, {error: 'Packaging material not found'}, 404);
        data = {
            packaging_material_id: id,
            purchase_history: database.purchases
                .filter(item => item.type === 'Packaging' && (
                    Number(item.material_id) === id
                    || (item.material_id === undefined && item.name === material.name)
                ))
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
                .map(item => ({...item}))
        };
    } else if (method === 'get' && path.startsWith('/packaging-supplier/') && path.endsWith('/purchase-history')) {
        const supplier = database.packagingSuppliers.find(item => item.id === id);
        data = {supplier, purchase_history: database.purchases.filter(item => item.type === 'Packaging' && item.supplier_id === id).map(item => ({material: item.name, quantity_purchased: item.quantity, purchase_date: item.date, purchase_price_per_unit: item.price_per_item, purchase_total_price: item.total_price})), materials: database.packagingMaterials.filter(item => item.packaging_material_supplier_id === id).map(item => ({id: item.id, name: item.name}))};
    } else if (method === 'post' && path === '/add_new_packaging_suppliers') {
        const supplier = {...body, id: nextId(database.packagingSuppliers), is_active: true};
        database.packagingSuppliers.push(supplier); database.suppliers.push({...supplier, type: 'packaging'}); persist(); data = supplier;
    } else if (method === 'put' && path.startsWith('/packaging_supplier_edit/')) {
        database.packagingSuppliers = database.packagingSuppliers.map(item => item.id === id ? {...item, ...body} : item);
        database.suppliers = database.suppliers.map(item => item.id === id && item.type === 'packaging' ? {...item, ...body} : item); persist();
    } else if (method === 'delete' && path.startsWith('/delete_packaging_supplier/')) {
        database.packagingSuppliers = database.packagingSuppliers.filter(item => item.id !== id);
        database.suppliers = database.suppliers.filter(item => !(item.id === id && item.type === 'packaging')); persist();
    } else if (method === 'delete' && path === '/delete_all_materials') {
        database.packagingMaterials = []; persist();
    } else if (method === 'delete' && path === '/delete_all_products') {
        database.products = []; persist();
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
            supplier_name: supplier?.name || material.supplier?.name || '',
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
        const before = Number(product.available_quantity || 0);
        product.available_quantity = actualQuantity;
        product.total_quantity = Number(product.total_quantity || 0) + actualQuantity - before;
        const changeAmount = actualQuantity - before;
        addProductStockHistory(id, 'inventory', changeAmount, before, actualQuantity, String(body.reason || '') || null);
        addProductAuditHistory(id, 'inventory', 'available_quantity', before, actualQuantity, String(body.reason || '') || null);
        const stockHistory = database.productStockHistory[database.productStockHistory.length - 1];
        persist();
        data = {message: 'Інвентаризацію виконано', product_id: id, quantity_before: before, quantity_after: actualQuantity, change_amount: changeAmount, deleted_gift_sets: [], available_quantity: actualQuantity, reserved_quantity: Number(product.reserved_quantity || 0), stock_history: stockHistory};
    } else if (method === 'delete' && path.startsWith('/delete-history/')) {
        data = {message: 'Демо-запис історії видалено'};
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
        let totalPrice = 0;
        const products: Record<string, unknown>[] = [];
        const packagings: Record<string, unknown>[] = [];
        for (const item of items) {
            const quantity = Number(item.quantity || 1);
            if (item.item_type === 'product') {
                const product = database.products.find(value => value.id === Number(item.item_id));
                if (!product || Number(product.available_quantity) < quantity) return response(config, {error: 'Товар відсутній або недостатній залишок'}, 400);
                product.available_quantity = Number(product.available_quantity) - quantity;
                product.reserved_quantity = Number(product.reserved_quantity || 0) + quantity;
                totalPrice += Number(product.purchase_price_per_item || 0) * quantity;
                products.push({product_id: product.id, name: product.name, quantity, price: product.purchase_price_per_item});
            } else if (item.item_type === 'packaging') {
                const material = database.packagingMaterials.find(value => value.id === Number(item.item_id));
                if (!material || Number(material.available_quantity) < quantity) return response(config, {error: 'Пакування відсутнє або недостатній залишок'}, 400);
                material.available_quantity = Number(material.available_quantity) - quantity;
                material.reserved_quantity = Number(material.reserved_quantity || 0) + quantity;
                totalPrice += Number(material.purchase_price_per_unit || 0) * quantity;
                packagings.push({packaging_id: material.id, name: material.name, quantity, price: material.purchase_price_per_unit});
            }
        }
        const giftSet = {id: nextId(database.giftSets), name: body.name, description: body.description, gift_selling_price: Number(body.gift_selling_price || 0), total_price: totalPrice, products, packagings, is_sold: false};
        database.giftSets.push(giftSet); persist(); data = {message: 'Gift set created successfully', id: giftSet.id};
    } else if (method === 'put' && path.startsWith('/update_gift_set/')) {
        const giftSet = database.giftSets.find(item => item.id === id);
        if (giftSet) {
            for (const item of (giftSet.products as Record<string, unknown>[] || [])) {
                const product = database.products.find(value => value.id === Number(item.product_id));
                if (product) { product.available_quantity = Number(product.available_quantity) + Number(item.quantity || 0); product.reserved_quantity = Math.max(0, Number(product.reserved_quantity || 0) - Number(item.quantity || 0)); }
            }
            for (const item of (giftSet.packagings as Record<string, unknown>[] || [])) {
                const material = database.packagingMaterials.find(value => value.id === Number(item.packaging_id));
                if (material) { material.available_quantity = Number(material.available_quantity) + Number(item.quantity || 0); material.reserved_quantity = Math.max(0, Number(material.reserved_quantity || 0) - Number(item.quantity || 0)); }
            }
            const items = Array.isArray(body.items) ? body.items as Record<string, unknown>[] : [];
            const products: Record<string, unknown>[] = [];
            const packagings: Record<string, unknown>[] = [];
            let totalPrice = 0;
            for (const item of items) {
                const quantity = Number(item.quantity || 1);
                if (item.type === 'product') {
                    const product = database.products.find(value => value.id === Number(item.product_id));
                    if (!product || Number(product.available_quantity) < quantity) return response(config, {error: 'Товар відсутній або недостатній залишок'}, 400);
                    product.available_quantity = Number(product.available_quantity) - quantity;
                    product.reserved_quantity = Number(product.reserved_quantity || 0) + quantity;
                    totalPrice += Number(item.price ?? product.purchase_price_per_item ?? 0) * quantity;
                    products.push({product_id: product.id, name: product.name, quantity, price: item.price ?? product.purchase_price_per_item});
                } else if (item.type === 'packaging') {
                    const material = database.packagingMaterials.find(value => value.id === Number(item.packaging_id));
                    if (!material || Number(material.available_quantity) < quantity) return response(config, {error: 'Пакування відсутнє або недостатній залишок'}, 400);
                    material.available_quantity = Number(material.available_quantity) - quantity;
                    material.reserved_quantity = Number(material.reserved_quantity || 0) + quantity;
                    totalPrice += Number(material.purchase_price_per_unit || 0) * quantity;
                    packagings.push({packaging_id: material.id, name: material.name, quantity, price: material.purchase_price_per_unit});
                }
            }
            Object.assign(giftSet, {name: body.name ?? giftSet.name, description: body.description ?? giftSet.description, gift_selling_price: body.gift_selling_price ?? giftSet.gift_selling_price, products, packagings, total_price: totalPrice});
        }
        persist(); data = {message: 'Gift set updated successfully', id};
    } else if (method === 'delete' && path.startsWith('/remove_gift_set/')) {
        const giftSet = database.giftSets.find(item => item.id === id);
        if (giftSet) {
            for (const item of (giftSet.products as Record<string, unknown>[] || [])) {
                const product = database.products.find(value => value.id === Number(item.product_id));
                if (product) { product.available_quantity = Number(product.available_quantity) + Number(item.quantity || 0); product.reserved_quantity = Math.max(0, Number(product.reserved_quantity || 0) - Number(item.quantity || 0)); }
            }
            for (const item of (giftSet.packagings as Record<string, unknown>[] || [])) {
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
            name: product.name,
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
        addProductStockHistory(id, 'purchase', quantity, before, product.available_quantity);
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
        addProductStockHistory(id, 'sale', -quantity, before, product.available_quantity);
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
        if (giftSet && customer) {
            const products = giftSet.products as Record<string, unknown>[] || [];
            const packagings = giftSet.packagings as Record<string, unknown>[] || [];
            products.forEach(item => {
                const product = database.products.find(value => value.id === Number(item.product_id));
                if (product) { product.reserved_quantity = Math.max(0, Number(product.reserved_quantity || 0) - Number(item.quantity || 0)); product.sold_quantity = Number(product.sold_quantity || 0) + Number(item.quantity || 0); }
            });
            packagings.forEach(item => {
                const material = database.packagingMaterials.find(value => value.id === Number(item.packaging_id));
                if (material) { material.reserved_quantity = Math.max(0, Number(material.reserved_quantity || 0) - Number(item.quantity || 0)); material.sold_quantity = Number(material.sold_quantity || 0) + Number(item.quantity || 0); }
            });
            giftSet.is_sold = true;
            const sale = {id: nextId(database.giftSetSales || []), gift_set_id: id, sold_at: new Date().toISOString(), sold_price: Number(body.selling_price || 0), quantity: 1, customer_name: customer.name, customer_id: customer.id, products, packagings};
            database.giftSetSales = [...(database.giftSetSales || []), sale];
            persist(); data = {message: 'Gift set sold successfully', sales_record: sale};
        } else data = {error: 'Gift set or customer not found'};
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
            addProductStockHistory(Number(product.id), 'return', quantity, before, product.available_quantity, returned.return_reason);
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
