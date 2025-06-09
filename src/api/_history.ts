// Видалення історії
import {API_ENDPOINTS, deleteResource} from "./api";
import {IonDeleteHistoryRecord} from "../utils/types";

export const onDeleteHistoryRecord = ({productId, historyType, historyId}: IonDeleteHistoryRecord): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_HISTORY({productId, historyId, historyType}));
};
