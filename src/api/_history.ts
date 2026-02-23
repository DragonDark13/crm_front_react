// Видалення історії
import {API_ENDPOINTS, deleteResource, fetchResource} from "./api";
import {ICustomer, IonDeleteHistoryRecord} from "../utils/types";


export interface IPurchaseTableResponseResponse {
    id: number;
    name: string;
    type: "Product" | 'Other Investment' | 'Packaging' ;
    date: string; // ISO date string (YYYY-MM-DD)

    categories: number[];

    quantity: number;

    price_per_item: string; // приходить як string з backend
    total_price: string;    // також string

    supplier_id: number;
    supplier_name: string;
    supplier_is_active: boolean;
}


export const onDeleteHistoryRecord = ({productId, historyType, historyId}: IonDeleteHistoryRecord): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_HISTORY({productId, historyId, historyType}));
};


export const fetchGetAllPurchaseHistory = (): Promise<IPurchaseTableResponseResponse[]> => {
    return fetchResource<IPurchaseTableResponseResponse[]>(API_ENDPOINTS.GET_ALL_PURCHASE_HISTORY);
};
