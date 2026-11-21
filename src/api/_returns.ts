import {API_ENDPOINTS, fetchResource, postResource} from "./api";
import {CreateCustomerReturnResponse, CustomerReturn} from "./contracts";

export interface CreateCustomerReturnData {
    quantity: number;
    reason: string;
}

export const fetchCustomerReturns = (): Promise<CustomerReturn[]> => {
    return fetchResource<CustomerReturn[]>(API_ENDPOINTS.CUSTOMER_RETURNS);
};

export const createCustomerReturn = (
    saleId: number,
    data: CreateCustomerReturnData
): Promise<CreateCustomerReturnResponse> => {
    return postResource<CreateCustomerReturnResponse>(API_ENDPOINTS.CREATE_CUSTOMER_RETURN(saleId), data);
};
