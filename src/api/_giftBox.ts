import {GiftSetPayload, IGiftSet} from "../utils/types";
import {API_ENDPOINTS, axiosInstance, deleteResource, fetchResource, postResource, putResource} from "./api";


export const createGiftBox = (newGiftBox: GiftSetPayload): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.CREATE_GIFT_SET, newGiftBox);
};

export const fetchGiftSets = (): Promise<IGiftSet[]> => {
    return fetchResource<IGiftSet[]>(API_ENDPOINTS.GET_ALL_GIFT_SETS);
};

export const removeGiftSet = (giftSetId: number): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.REMOVE_GIFT_SET(giftSetId))
};

export const updateGiftSet = (updatedGiftBox: IGiftSet): Promise<void> => {
    return putResource(API_ENDPOINTS.UPDATE_GIFT_SET(updatedGiftBox.id), updatedGiftBox)
};


export const sellGiftSet = (requestData: {
    gift_set_id: number;
    customer_id: number;
    sale_date: string | null;
    selling_price: number;
}): Promise<void> => {
    return postResource(API_ENDPOINTS.SELL_GIFT_SET(requestData.gift_set_id), {
        customer_id: requestData.customer_id || null,
        selling_price: requestData.selling_price,
        sale_date: requestData.sale_date || null,
    });
};