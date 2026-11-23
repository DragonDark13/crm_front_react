import {API_ENDPOINTS, axiosInstance, fetchResource} from "./api";
import type {OrderRecord, OrderStatus, ApiMessageResponse} from "./contracts";

export const fetchOrders = (): Promise<OrderRecord[]> =>
    fetchResource<OrderRecord[]>(API_ENDPOINTS.ORDERS);

export const updateOrderStatus = (
    orderId: number,
    status: OrderStatus
): Promise<ApiMessageResponse & {order: OrderRecord}> =>
    axiosInstance.patch<ApiMessageResponse & {order: OrderRecord}>(API_ENDPOINTS.ORDER_STATUS(orderId), {status}).then(response => response.data);
