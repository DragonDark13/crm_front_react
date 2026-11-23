import type {AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {AxiosHeaders} from 'axios';
import {createInitialDemoDatabase, DEMO_STORAGE_KEY, type DemoDatabase} from './demoData';

const readDatabase = (): DemoDatabase => {
    try {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        return stored ? JSON.parse(stored) as DemoDatabase : createInitialDemoDatabase();
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

const response = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse => ({
    data,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: new AxiosHeaders({'content-type': 'application/json'}),
    config
});

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
    let data: unknown = {message: 'Демо-операцію виконано'};

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
        data = database.giftSets;
    } else if (method === 'get' && path === '/get_all_purchase_history') {
        data = database.purchases;
    } else if (method === 'get' && path === '/get_all_sales_history') {
        data = database.sales;
    } else if (method === 'get' && path === '/returns') {
        data = database.returns;
    } else if (method === 'get' && path === '/financial-journal') {
        data = [...database.purchases, ...database.sales].sort((a, b) => String(b.date || b.sale_date).localeCompare(String(a.date || a.sale_date)));
    } else if (method === 'get' && path.startsWith('/statistics/')) {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        if (path.endsWith('/monthly')) data = Array.from({length: 6}, (_, index) => ({year, month: Math.max(1, month - 5 + index), total_sales: 1800 + index * 240, total_quantity: 8 + index, total_profit: 650 + index * 90, total_spent: 900 + index * 110, avg_price: 120}));
        else if (path.endsWith('/top-products')) data = database.products.slice(0, 5).map(product => ({product_id: product.id, name: product.name, total_sold: product.sold_quantity, total_sales: product.selling_total_price}));
        else if (path.endsWith('/stock')) data = database.products.map(product => ({id: product.id, name: product.name, available_quantity: product.available_quantity, total_quantity: product.total_quantity}));
        else if (path.endsWith('/profit-expense')) data = Array.from({length: 6}, (_, index) => ({year, month: Math.max(1, month - 5 + index), sales: 2200 + index * 200, profit: 700 + index * 80, expenses: 900 + index * 60}));
        else data = Array.from({length: 7}, (_, index) => ({day: new Date(Date.now() - (6 - index) * 86400000).toISOString().slice(0, 10), active_customers: 2 + index % 4}));
    } else if (method === 'get' && path.startsWith('/product/') && path.endsWith('/history')) {
        data = {stock_history: [], purchase_history: [], sale_history: [], audit_history: []};
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
        const product = {...body, id: nextId(database.products), supplier: database.suppliers.find(item => item.id === Number(body.supplier_id)) || null, available_quantity: body.available_quantity ?? body.total_quantity ?? 0, reserved_quantity: 0, sold_quantity: 0};
        database.products.push(product); persist(); data = makeProductResponse(product);
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
        data = {packaging_material_id: id, purchase_history: [], sales_history: [], stock_history: []};
    } else if (method === 'get' && path.startsWith('/packaging-supplier/') && path.endsWith('/purchase-history')) {
        const supplier = database.packagingSuppliers.find(item => item.id === id);
        data = {supplier, purchase_history: [], materials: database.packagingMaterials.filter(item => item.packaging_material_supplier_id === id).map(item => ({id: item.id, name: item.name}))};
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
        if (material) material.available_quantity = Math.max(0, Number(material.available_quantity) - Number(body.quantity_used || 0));
        persist(); data = {message: 'Залишок пакування оновлено', material};
    } else if (method === 'post' && path === '/purchase_current_packaging') {
        const material = database.packagingMaterials.find(item => item.id === Number(body.material_id));
        if (material) {
            material.available_quantity = Number(material.available_quantity) + Number(body.quantity || 0);
            material.total_quantity = Number(material.total_quantity) + Number(body.quantity || 0);
            material.total_purchase_cost = Number(material.total_purchase_cost) + Number(body.total_purchase_cost || 0);
        }
        persist(); data = {message: 'Пакування закуплено', material};
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/inventory')) {
        const product = database.products.find(item => item.id === id);
        const before = Number(product?.available_quantity || 0);
        if (product) { product.available_quantity = Number(body.actual_quantity || 0); product.total_quantity = Number(product.total_quantity || 0) + Number(body.actual_quantity || 0) - before; }
        persist(); data = {message: 'Інвентаризацію виконано', product_id: id, quantity_before: before, quantity_after: Number(body.actual_quantity || 0), change_amount: Number(body.actual_quantity || 0) - before, deleted_gift_sets: [], available_quantity: Number(body.actual_quantity || 0), reserved_quantity: 0, stock_history: {}};
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
        database.giftSets.push({...body, id: nextId(database.giftSets), total_price: 0, products: [], packagings: []}); persist();
    } else if (method === 'put' && path.startsWith('/update_gift_set/')) {
        database.giftSets = database.giftSets.map(item => item.id === id ? {...item, ...body} : item); persist();
    } else if (method === 'delete' && path.startsWith('/remove_gift_set/')) {
        database.giftSets = database.giftSets.filter(item => item.id !== id); persist();
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/purchase')) {
        const product = database.products.find(item => item.id === id);
        if (product) { product.available_quantity = Number(product.available_quantity) + Number(body.quantity || 0); product.total_quantity = Number(product.total_quantity) + Number(body.quantity || 0); }
        persist();
    } else if (method === 'post' && path.startsWith('/product/') && path.endsWith('/sale')) {
        const product = database.products.find(item => item.id === id);
        const quantity = Number(body.quantity || 0);
        if (product) { product.available_quantity = Math.max(0, Number(product.available_quantity) - quantity); product.sold_quantity = Number(product.sold_quantity) + quantity; }
        const sale = {id: nextId(database.sales), product_id: id, product_name: product?.name || '', customer_id: Number(body.customer) || null, customer_name: database.customers.find(item => item.id === Number(body.customer))?.name || 'Гість', quantity_sold: quantity, selling_price_per_item: Number(body.selling_price_per_item || 0), selling_total_price: Number(body.selling_total_price || 0), sale_date: String(body.sale_date || new Date().toISOString().slice(0, 10)), profit: 0};
        database.sales.push(sale); persist();
    } else if (method === 'post' && path === '/packaging_materials/purchase') {
        const material = {id: nextId(database.packagingMaterials), name: body.name, available_quantity: Number(body.quantity_purchased), total_quantity: Number(body.quantity_purchased), reorder_level: 5, packaging_material_supplier_id: Number(body.supplier_id), purchase_price_per_unit: Number(body.purchase_price_per_unit), total_purchase_cost: Number(body.total_purchase_cost), available_stock_cost: Number(body.total_purchase_cost), created_date: new Date().toISOString().slice(0, 10), supplier: database.packagingSuppliers[0]};
        database.packagingMaterials.push(material); persist();
    } else if (method === 'post' && path.startsWith('/sales/') && path.endsWith('/returns')) {
        const returned = {id: nextId(database.returns), sale_id: id, product_id: null, product_name: '', customer_id: null, customer_name: '', quantity_returned: Number(body.quantity), return_amount: 0, return_reason: body.reason, return_date: new Date().toISOString().slice(0, 10), returned_by_username: 'demo.manager'};
        database.returns.push(returned); persist(); data = {message: 'Повернення створено', return: returned, available_quantity: 0, remaining_return_quantity: 0};
    }

    return response(config, data);
};

export default adapter;
