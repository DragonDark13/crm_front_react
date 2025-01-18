import {ICustomer, ICustomerDetails} from "../utils/types";
import {API_ENDPOINTS, axiosInstance, fetchResource, postResource} from "./api";

export const createCustomer = (customerData: ICustomerDetails): Promise<ICustomer> => {
    return postResource<ICustomer>(API_ENDPOINTS.CREATED_CUSTOMER, customerData);
};

export const fetchGetAllCustomers = (): Promise<ICustomer[]> => {
    return fetchResource<ICustomer[]>(API_ENDPOINTS.CUSTOMERS);
};

export const fetchCustomerDetails = (customerId: number): Promise<ICustomerDetails> => {
    return fetchResource<ICustomerDetails>(API_ENDPOINTS.CUSTOMER_DETAILS(customerId));
};

export const updateCustomerData = async (customerData: ICustomerDetails) => {
    try {
        await axiosInstance.put(`/update_customers/${customerData.id}`, customerData);
    } catch (error) {
        console.error('Error updating customer:', error);
    }
};

export const deleteCustomerData = async (customerId: number) => {
    try {
        await axiosInstance.delete(`/delete_customers/${customerId}`);
    } catch (error) {
        console.error('Error deleting customer:', error);
    }
};