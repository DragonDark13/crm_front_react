// Операції з постачальниками
import {INewSupplier, IProduct, ISupplierFull, ISupplierPurchaseHistoryResponse} from "../utils/types";
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";

export const addSupplier = (newSupplier: INewSupplier): Promise<{ message: string; supplier_id: number }> => {
    return postResource<{ message: string; supplier_id: number }>(API_ENDPOINTS.ADD_SUPPLIERS, newSupplier);
};

export const updateSupplier = (supplierId: number, editSupplier: ISupplierFull) => {
    return putResource(API_ENDPOINTS.EDIT_SUPPLIERS(supplierId), editSupplier);
};

export const fetchGetAllSuppliers = (): Promise<ISupplierFull[]> => {
    return fetchResource<ISupplierFull[]>(API_ENDPOINTS.GET_ALL_SUPPLIERS);
};

export const fetchGetSupplierPurchaseHistory = (supplierId: number): Promise<ISupplierPurchaseHistoryResponse> => {
    return fetchResource<ISupplierPurchaseHistoryResponse>(API_ENDPOINTS.SUPPLIER_PURCHASE_HISTORY(supplierId));
};

export const fetchGetSupplierProducts = (supplierId: number): Promise<IProduct[]> => {
    return fetchResource<IProduct[]>(API_ENDPOINTS.SUPPLIER_PRODUCTS(supplierId));
};


export const deleteSupplier = (supplierId: number): Promise<void> => {
    return deleteResource<void>(API_ENDPOINTS.DELETE_SUPPLIER(supplierId));
};

