import {API_ENDPOINTS, fetchResource} from "./api";

export const fetchSalesHistory = <T>(signal?: AbortSignal): Promise<T> => {
    const config = signal ? {signal} : {};
    return fetchResource<T>(API_ENDPOINTS.SALES_HISTORY, config);
};
