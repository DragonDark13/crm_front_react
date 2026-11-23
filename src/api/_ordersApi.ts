import {API_ENDPOINTS, fetchResource, patchResource} from "./api";
import type {OrderRecord, OrderStatus, ApiMessageResponse} from "./contracts";

export const fetchOrders = (): Promise<OrderRecord[]> =>
    fetchResource<OrderRecord[]>(API_ENDPOINTS.ORDERS);

export const updateOrderStatus = (
    orderId: number,
    status: OrderStatus
): Promise<ApiMessageResponse & {order: OrderRecord}> =>
    patchResource<ApiMessageResponse & {order: OrderRecord}>(
        API_ENDPOINTS.ORDER_STATUS(orderId),
        {status}
    );
