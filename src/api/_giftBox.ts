import {GiftSetPayload, ICustomer, ICustomerDetails} from "../utils/types";
import {API_ENDPOINTS, postResource} from "./api";


export const createGiftBox = (newGiftBox: GiftSetPayload): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.CREATE_GIFT_SET, newGiftBox);
};