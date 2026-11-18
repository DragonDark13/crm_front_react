import {ICustomer, ICustomerDetailForCreate, ICustomerDetails, INewGiftCustomerDetails} from "../utils/types";
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";

export const createCustomer = (customerData: ICustomerDetailForCreate): Promise<ICustomer> => {
    return postResource<ICustomer>(API_ENDPOINTS.CREATED_CUSTOMER, customerData);
};

export const fetchGetAllCustomers = (): Promise<ICustomer[]> => {
    return fetchResource<ICustomer[]>(API_ENDPOINTS.CUSTOMERS);
};

export const fetchCustomerDetails = (customerId: number): Promise<ICustomerDetails> => {
    return fetchResource<ICustomerDetails>(API_ENDPOINTS.CUSTOMER_DETAILS(customerId));
};

export const updateCustomerData = (customerData: ICustomerDetails): Promise<void> => {
    return putResource<void>(`/update_customers/${customerData.id}`, customerData);
};

export const deleteCustomerData = (customerId: number): Promise<void> => {
    return deleteResource<void>(`/delete_customers/${customerId}`);
};