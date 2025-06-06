// Видалення історії
import {API_ENDPOINTS, deleteResource} from "./api";

export const onDeleteHistoryRecord = (productId: number, historyType: string, historyId: number): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_HISTORY(productId, historyType, historyId));
};
