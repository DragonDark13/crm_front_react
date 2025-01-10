// Видалення історії
import {axiosInstance} from "./api";

export const onDeleteHistoryRecord = (productId: number, historyType: string, historyId: number) => {
    return axiosInstance.delete(`/delete-history/${productId}/${historyType}/${historyId}`);
};
