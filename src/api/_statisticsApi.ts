import {API_ENDPOINTS, fetchResource} from "./api";

export interface MonthlyStatistics {
    month: number;
    total_sales?: number;
    total_spent?: number;
    total_quantity?: number;
    profit?: number;
    sales?: number;
    expenses?: number;
    [key: string]: unknown;
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

export interface DashboardStatistics {
    monthlySales: MonthlyStatistics[];
    monthlyPurchases: MonthlyStatistics[];
    topProducts: TopProductStatistics[];
    stockLevels: StockLevelStatistics[];
    profitExpenses: MonthlyStatistics[];
    customerActivity: CustomerActivityStatistics[];
}

export const fetchDashboardStatistics = (signal?: AbortSignal): Promise<DashboardStatistics> => {
    const config = signal ? {signal} : {};

    return Promise.all([
        fetchResource<MonthlyStatistics[]>(API_ENDPOINTS.DASHBOARD_MONTHLY_SALES, config),
        fetchResource<MonthlyStatistics[]>(API_ENDPOINTS.DASHBOARD_MONTHLY_PURCHASES, config),
        fetchResource<TopProductStatistics[]>(API_ENDPOINTS.DASHBOARD_TOP_PRODUCTS, config),
        fetchResource<StockLevelStatistics[]>(API_ENDPOINTS.DASHBOARD_STOCK, config),
        fetchResource<MonthlyStatistics[]>(API_ENDPOINTS.DASHBOARD_PROFIT_EXPENSE, config),
        fetchResource<CustomerActivityStatistics[]>(API_ENDPOINTS.DASHBOARD_CUSTOMER_ACTIVITY, config)
    ]).then(([
        monthlySales,
        monthlyPurchases,
        topProducts,
        stockLevels,
        profitExpenses,
        customerActivity
    ]) => ({
        monthlySales,
        monthlyPurchases,
        topProducts,
        stockLevels,
        profitExpenses,
        customerActivity
    }));
};
