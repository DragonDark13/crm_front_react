import {API_ENDPOINTS, fetchResource} from "./api";
import {
    CustomerActivityStatistics,
    MonthlyPurchaseStatistics,
    MonthlySalesStatistics,
    ProfitExpenseStatistics,
    StockLevelStatistics,
    TopProductStatistics
} from "./contracts";

export interface DashboardStatistics {
    monthlySales: MonthlySalesStatistics[];
    monthlyPurchases: MonthlyPurchaseStatistics[];
    topProducts: TopProductStatistics[];
    stockLevels: StockLevelStatistics[];
    profitExpenses: ProfitExpenseStatistics[];
    customerActivity: CustomerActivityStatistics[];
}

export const fetchDashboardStatistics = (signal?: AbortSignal): Promise<DashboardStatistics> => {
    const config = signal ? {signal} : {};

    return Promise.all([
        fetchResource<MonthlySalesStatistics[]>(API_ENDPOINTS.DASHBOARD_MONTHLY_SALES, config),
        fetchResource<MonthlyPurchaseStatistics[]>(API_ENDPOINTS.DASHBOARD_MONTHLY_PURCHASES, config),
        fetchResource<TopProductStatistics[]>(API_ENDPOINTS.DASHBOARD_TOP_PRODUCTS, config),
        fetchResource<StockLevelStatistics[]>(API_ENDPOINTS.DASHBOARD_STOCK, config),
        fetchResource<ProfitExpenseStatistics[]>(API_ENDPOINTS.DASHBOARD_PROFIT_EXPENSE, config),
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
