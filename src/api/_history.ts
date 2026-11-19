// Видалення історії
import {API_ENDPOINTS, deleteResource, fetchResource} from "./api";
import {ICustomer, IonDeleteHistoryRecord} from "../utils/types";


export interface IPurchaseTableResponseResponse {
    id: number;
    name: string;
    type: "Product" | "Other Investment" | "Packaging";
    date: string;
    categories: number[];
    quantity: number | null;
    price_per_item: string | number | null;
    total_price: string | number;
    supplier_id: number | null;
    supplier_name: string;
    supplier_is_active: boolean;
}


export const onDeleteHistoryRecord = ({productId, historyType, historyId}: IonDeleteHistoryRecord): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_HISTORY({productId, historyId, historyType}));
};


export const fetchGetAllPurchaseHistory = (): Promise<IPurchaseTableResponseResponse[]> => {
    return fetchResource<IPurchaseTableResponseResponse[]>(API_ENDPOINTS.GET_ALL_PURCHASE_HISTORY);
};
