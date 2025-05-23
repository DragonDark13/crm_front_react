// Операції з постачальниками
import {INewSupplier, IProduct, ISupplierFull} from "../utils/types";
import {API_ENDPOINTS, axiosInstance, fetchResource, handleError, postResource} from "./api";

export const addSupplier = (newSupplier: INewSupplier): Promise<{ message: string; supplier_id: number }> => {
    return postResource<{ message: string; supplier_id: number }>(API_ENDPOINTS.ADD_SUPPLIERS, newSupplier);
};

export const updateSupplier = (supplierId: number, editSupplier: ISupplierFull): Promise<void> => {
    return axiosInstance.put(API_ENDPOINTS.EDIT_SUPPLIERS(supplierId), editSupplier).catch(handleError);
};

export const fetchGetAllSuppliers = (): Promise<ISupplierFull[]> => {
    return fetchResource<ISupplierFull[]>(API_ENDPOINTS.GET_ALL_SUPPLIERS);
};

export const fetchGetSupplierPurchaseHistory = (supplierId: number): Promise<{ purchase_history: any[]; products: IProduct[] }> => {
    return fetchResource<{ purchase_history: any[]; products: IProduct[] }>(API_ENDPOINTS.SUPPLIER_PURCHASE_HISTORY(supplierId));
};

export const fetchGetSupplierProducts = (supplierId: number): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.SUPPLIER_PRODUCTS(supplierId));
};


export const deleteSupplier = (supplierId: number): Promise<void> => {
    return axiosInstance
        .delete(API_ENDPOINTS.DELETE_SUPPLIER(supplierId))
        .then(() => console.log(`Supplier with ID ${supplierId} deleted successfully.`))
        .catch(handleError);
};