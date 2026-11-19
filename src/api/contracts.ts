export interface ApiMessageResponse {
    message: string;
}

export interface ApiErrorResponse {
    error?: string;
    message?: string;
    details?: string;
    errors?: Record<string, string>;
}

export interface CreateCustomerResponse extends ApiMessageResponse {
    customer: import("../utils/types").ICustomer;
}

export interface CreateSupplierResponse extends ApiMessageResponse {
    supplier_id: number;
}

export interface CreateCategoryResponse extends ApiMessageResponse {
    category: {
        id: number;
        name: string;
    };
}

export interface ProductMutationResponse {
    id: number;
    name: string;
    supplier_id: number | null;
    total_quantity: number;
    available_quantity: number;
    reserved_quantity: number;
    sold_quantity: number;
    purchase_total_price: number;
    purchase_price_per_item: number;
    selling_total_price: number;
    selling_price_per_item: number;
    created_date: string | null;
    article: string;
    product_description: string;
}

export interface ProductInventoryResponse extends ApiMessageResponse {
    product_id: number;
    quantity_before: number;
    quantity_after: number;
    change_amount: number;
    deleted_gift_sets: number[];
    available_quantity: number;
    reserved_quantity: number;
    stock_history: Record<string, unknown>;
}

export interface PackagingMaterialResponse extends ApiMessageResponse {
    material: import("../utils/types").IMaterial;
}

export interface PackagingSupplierResponse {
    id: number;
    name: string;
    contact_info: string | null;
    email?: string | null;
    phone_number?: string | null;
    address?: string | null;
    is_active?: boolean;
}

export interface SupplierPurchaseHistoryResponse {
    supplier: string;
    purchase_history: Array<{
        product: string;
        quantity_purchase: number;
        purchase_date: string;
        purchase_price_per_item: number;
        purchase_total_price: number;
    }>;
    products: Array<{
        id: number;
        name: string;
    }>;
}

export interface PackagingSupplierPurchaseHistoryResponse {
    supplier: PackagingSupplierResponse;
    purchase_history: Array<{
        material: string | null;
        quantity_purchased: number;
        purchase_date: string;
        purchase_price_per_unit: number;
        purchase_total_price: number;
    }>;
    materials: Array<{
        id: number;
        name: string;
    }>;
}

export interface MonthlySalesStatistics {
    year: number;
    month: number;
    total_sales: number;
    total_quantity: number;
    total_profit: number;
}

export interface MonthlyPurchaseStatistics {
    year: number;
    month: number;
    total_spent: number;
    total_quantity: number;
    avg_price: number;
}

export interface ProfitExpenseStatistics {
    year: number;
    month: number;
    sales: number;
    profit: number;
    expenses: number;
}

export interface TopProductStatistics {
    product_id: number;
    name: string;
    total_sold: number;
    total_sales: number;
}

export interface StockLevelStatistics {
    id: number;
    name: string;
    available_quantity: number;
    total_quantity: number;
}

export interface CustomerActivityStatistics {
    day: string;
    active_customers: number;
}

export interface GiftSetCreateResponse extends ApiMessageResponse {
    id: number;
}

export interface LoginResponse extends ApiMessageResponse {
    token: string;
}
