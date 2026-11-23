export interface DemoDatabase {
    products: Record<string, unknown>[];
    suppliers: Record<string, unknown>[];
    categories: Record<string, unknown>[];
    customers: Record<string, unknown>[];
    packagingMaterials: Record<string, unknown>[];
    packagingSuppliers: Record<string, unknown>[];
    investments: Record<string, unknown>[];
    giftSets: Record<string, unknown>[];
    purchases: Record<string, unknown>[];
    sales: Record<string, unknown>[];
    returns: Record<string, unknown>[];
    giftSetSales: Record<string, unknown>[];
    productStockHistory: Record<string, unknown>[];
    productAuditHistory: Record<string, unknown>[];
    packagingStockHistory: Record<string, unknown>[];
    packagingSalesHistory: Record<string, unknown>[];
}

export const DEMO_STORAGE_KEY = 'crm_demo_database_v1';

export const createInitialDemoDatabase = (): DemoDatabase => {
    const suppliers = [
        {id: 1, name: 'ТОВ «Світ подарунків»', contact_info: 'Менеджер: Олена', email: 'sales@example.test', phone_number: '+380501112233', address: 'Київ, Україна', is_active: true, type: 'product'},
        {id: 2, name: 'Майстерня декору', contact_info: 'Оптові замовлення', email: 'decor@example.test', phone_number: '+380671234567', address: 'Львів, Україна', is_active: true, type: 'product'},
        {id: 3, name: 'ПакСервіс', contact_info: 'Пакувальні матеріали', email: 'pack@example.test', phone_number: '+380931234567', address: 'Харків, Україна', is_active: true, type: 'packaging'}
    ];
    const categories = [
        {id: 1, name: 'Аксесуари'}, {id: 2, name: 'Декор'}, {id: 3, name: 'Подарунки'}, {id: 4, name: 'Пакування'}
    ];
    const products = [
        {id: 1, name: 'Свічка ароматична «Лаванда»', available_quantity: 24, reserved_quantity: 2, total_quantity: 30, sold_quantity: 4, purchase_total_price: 1800, purchase_price_per_item: 60, selling_total_price: 520, selling_price_per_item: 130, selling_quantity: 4, article: 'CND-001', product_description: 'Ароматична свічка у скляній баночці', category_ids: [2,3], supplier: suppliers[0], created_date: '2026-10-02'},
        {id: 2, name: 'Набір листівок «Україна»', available_quantity: 8, reserved_quantity: 0, total_quantity: 20, sold_quantity: 12, purchase_total_price: 1000, purchase_price_per_item: 50, selling_total_price: 1440, selling_price_per_item: 120, selling_quantity: 12, article: 'CRD-002', product_description: 'Набір із шести ілюстрованих листівок', category_ids: [1,3], supplier: suppliers[1], created_date: '2026-09-18'},
        {id: 3, name: 'Керамічна чашка «Ліс»', available_quantity: 3, reserved_quantity: 0, total_quantity: 15, sold_quantity: 12, purchase_total_price: 2250, purchase_price_per_item: 150, selling_total_price: 3000, selling_price_per_item: 250, selling_quantity: 12, article: 'MUG-003', product_description: 'Керамічна чашка ручної роботи', category_ids: [2], supplier: suppliers[1], created_date: '2026-08-11'},
        {id: 4, name: 'Блокнот «Подорожі»', available_quantity: 16, reserved_quantity: 1, total_quantity: 20, sold_quantity: 3, purchase_total_price: 1400, purchase_price_per_item: 70, selling_total_price: 330, selling_price_per_item: 110, selling_quantity: 3, article: 'NTB-004', product_description: 'Блокнот у твердій обкладинці', category_ids: [1], supplier: suppliers[0], created_date: '2026-10-21'},
        {id: 5, name: 'Декоративна дерев’яна зірка', available_quantity: 0, reserved_quantity: 0, total_quantity: 10, sold_quantity: 10, purchase_total_price: 900, purchase_price_per_item: 90, selling_total_price: 1500, selling_price_per_item: 150, selling_quantity: 10, article: 'DEC-005', product_description: 'Дерев’яний декор для інтер’єру', category_ids: [2], supplier: suppliers[1], created_date: '2026-07-04'}
    ];
    const database: DemoDatabase = {
        products,
        suppliers,
        categories,
        customers: [
            {id: 1, name: 'Анна Коваленко', contact_info: 'Постійна клієнтка', email: 'anna@example.test', phone_number: '+380501010101', address: 'Харків, Україна'},
            {id: 2, name: 'Максим Петренко', contact_info: 'Замовлення онлайн', email: 'max@example.test', phone_number: '+380671010102', address: 'Полтава, Україна'},
            {id: 3, name: 'Ірина Мельник', contact_info: '', email: 'iryna@example.test', phone_number: '+380931010103', address: 'Київ, Україна'}
        ],
        packagingMaterials: [
            {id: 1, name: 'Коробка мала', available_quantity: 42, total_quantity: 50, reorder_level: 10, packaging_material_supplier_id: 3, purchase_price_per_unit: 18, total_purchase_cost: 900, available_stock_cost: 756, created_date: '2026-09-01', supplier: {id: 3, name: 'ПакСервіс', contact_info: 'Пакувальні матеріали', email: 'pack@example.test', phone_number: '+380931234567', address: 'Харків, Україна', is_active: true}},
            {id: 2, name: 'Папір тішью', available_quantity: 7, total_quantity: 100, reorder_level: 15, packaging_material_supplier_id: 3, purchase_price_per_unit: 2.5, total_purchase_cost: 250, available_stock_cost: 17.5, created_date: '2026-09-05', supplier: {id: 3, name: 'ПакСервіс', contact_info: 'Пакувальні матеріали', email: 'pack@example.test', phone_number: '+380931234567', address: 'Харків, Україна', is_active: true}}
        ],
        packagingSuppliers: [suppliers[2]],
        investments: [
            {id: 1, type_name: 'Оренда складу', cost: 4500, date: '2026-11-01', supplier: 'Орендодавець'},
            {id: 2, type_name: 'Реклама', cost: 1200, date: '2026-11-08', supplier: 'Рекламна платформа'}
        ],
        giftSets: [
            {id: 1, is_sold: false, name: 'Затишний вечір', description: 'Свічка та листівки у подарунковому пакуванні', total_price: 95, gift_selling_price: 290, products: [{product_id: 1, name: products[0].name, quantity: 1, price: 60}], packagings: [{packaging_id: 1, name: 'Коробка мала', quantity: 1, price: 18}]},
            {id: 2, is_sold: false, name: 'Лісова історія', description: 'Чашка та блокнот', total_price: 220, gift_selling_price: 420, products: [{product_id: 3, name: products[2].name, quantity: 1, price: 150}, {product_id: 4, name: products[3].name, quantity: 1, price: 70}], packagings: []}
        ],
        purchases: [
            {id: 1, product_id: 1, name: products[0].name, type: 'Product', date: '2026-10-02', categories: [2,3], quantity: 30, price_per_item: 60, total_price: 1800, supplier_id: 1, supplier_name: 'ТОВ «Світ подарунків»', supplier_is_active: true},
            {id: 2, product_id: 3, name: products[2].name, type: 'Product', date: '2026-08-11', categories: [2], quantity: 15, price_per_item: 150, total_price: 2250, supplier_id: 2, supplier_name: 'Майстерня декору', supplier_is_active: true},
            {id: 3, material_id: 1, name: 'Коробка мала', type: 'Packaging', date: '2026-09-01', categories: [4], quantity: 50, price_per_item: 18, total_price: 900, supplier_id: 3, supplier_name: 'ПакСервіс', supplier_is_active: true}
        ],
        sales: [
            {id: 1, product_id: 1, product_name: products[0].name, packaging_material_id: 1, packaging_quantity: 2, total_packaging_cost: 36, customer_id: 1, customer_name: 'Анна Коваленко', quantity_sold: 2, selling_price_per_item: 130, selling_total_price: 260, sale_date: '2026-11-04', profit: 140},
            {id: 2, product_id: 2, product_name: products[1].name, customer_id: 2, customer_name: 'Максим Петренко', quantity_sold: 3, selling_price_per_item: 120, selling_total_price: 360, sale_date: '2026-11-10', profit: 210},
            {id: 3, product_id: 3, product_name: products[2].name, packaging_material_id: 1, packaging_quantity: 1, total_packaging_cost: 18, customer_id: 3, customer_name: 'Ірина Мельник', quantity_sold: 1, selling_price_per_item: 250, selling_total_price: 250, sale_date: '2026-11-16', profit: 100}
        ],
        returns: [
            {id: 1, sale_id: 2, product_id: 2, product_name: products[1].name, customer_id: 2, customer_name: 'Максим Петренко', quantity_returned: 1, return_amount: 120, return_reason: 'Не підійшов дизайн', return_date: '2026-11-12', returned_by_username: 'demo.manager'}
        ],
        giftSetSales: [],
        productStockHistory: [],
        productAuditHistory: [],
        packagingStockHistory: [],
        packagingSalesHistory: []
    };

    let productStockHistoryId = 1;
    database.productStockHistory = [
        ...database.purchases.filter(item => item.type === 'Product' && Number(item.product_id) > 0).map(item => ({
            id: productStockHistoryId++,
            product_id: Number(item.product_id),
            timestamp: `${item.date} 09:00:00`,
            change_type: 'purchase',
            change_amount: Number(item.quantity || 0),
            quantity_before: null,
            quantity_after: null,
            reason: 'Початкові демонстраційні дані'
        })),
        ...database.sales.map(item => ({
            id: productStockHistoryId++,
            product_id: Number(item.product_id),
            timestamp: `${item.sale_date} 12:00:00`,
            change_type: 'sale',
            change_amount: -Number(item.quantity_sold || 0),
            quantity_before: null,
            quantity_after: null,
            reason: null
        })),
        ...database.returns.map(item => ({
            id: productStockHistoryId++,
            product_id: Number(item.product_id),
            timestamp: String(item.return_date),
            change_type: 'return',
            change_amount: Number(item.quantity_returned || 0),
            quantity_before: null,
            quantity_after: null,
            reason: String(item.return_reason || '')
        }))
    ];

    let productAuditHistoryId = 1;
    database.productAuditHistory = [
        ...database.purchases.filter(item => item.type === 'Product' && Number(item.product_id) > 0).map(item => ({
            id: productAuditHistoryId++,
            product_id: Number(item.product_id),
            changed_by_id: null,
            changed_by_username: 'demo.manager',
            action: 'purchase',
            field_name: 'available_quantity',
            old_value: null,
            new_value: String(item.quantity || 0),
            reason: 'Початкові демонстраційні дані',
            changed_at: `${item.date} 09:00:00`
        })),
        ...database.sales.map(item => ({
            id: productAuditHistoryId++,
            product_id: Number(item.product_id),
            changed_by_id: null,
            changed_by_username: 'demo.manager',
            action: 'sale',
            field_name: 'sold_quantity',
            old_value: null,
            new_value: String(item.quantity_sold || 0),
            reason: null,
            changed_at: `${item.sale_date} 12:00:00`
        })),
        ...database.returns.map(item => ({
            id: productAuditHistoryId++,
            product_id: Number(item.product_id),
            changed_by_id: null,
            changed_by_username: 'demo.manager',
            action: 'return',
            field_name: 'available_quantity',
            old_value: null,
            new_value: String(item.quantity_returned || 0),
            reason: String(item.return_reason || ''),
            changed_at: String(item.return_date)
        }))
    ];

    let packagingStockHistoryId = 1;
    database.packagingStockHistory = database.purchases
        .filter(item => item.type === 'Packaging' && Number(item.material_id) > 0)
        .map(item => ({
            id: packagingStockHistoryId++,
            material_id: Number(item.material_id),
            change_amount: Number(item.quantity || 0),
            change_type: 'purchase',
            timestamp: `${item.date} 09:00:00`
        }));

    database.packagingSalesHistory = database.sales
        .filter(item => Number(item.packaging_material_id) > 0)
        .map((item, index) => ({
            id: index + 1,
            sale_id: Number(item.id),
            packaging_material_id: Number(item.packaging_material_id),
            packaging_quantity: Number(item.packaging_quantity || 0),
            total_packaging_cost: Number(item.total_packaging_cost || 0),
            sale_date: String(item.sale_date)
        }));

    return database;
};
