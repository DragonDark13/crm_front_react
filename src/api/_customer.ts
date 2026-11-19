import {ICustomer, ICustomerDetailForCreate, ICustomerDetails} from "../utils/types";
import {CreateCustomerResponse} from "./contracts";
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";

export const createCustomer = (customerData: ICustomerDetailForCreate): Promise<CreateCustomerResponse> => {
    return postResource<CreateCustomerResponse>(API_ENDPOINTS.CREATED_CUSTOMER, customerData);
};

export const fetchGetAllCustomers = (): Promise<ICustomer[]> => {
    return fetchResource<ICustomer[]>(API_ENDPOINTS.CUSTOMERS);
};

export const fetchCustomerDetails = (customerId: number): Promise<ICustomerDetails> => {
    return fetchResource<ICustomerDetails>(API_ENDPOINTS.CUSTOMER_DETAILS(customerId));
};

export const updateCustomerData = (customerData: ICustomerDetails): Promise<ICustomerDetails> => {
    return putResource<ICustomerDetails>(`/update_customers/${customerData.id}`, customerData);
};

export const deleteCustomerData = (customerId: number): Promise<void> => {
    return deleteResource<void>(`/delete_customers/${customerId}`);
};
