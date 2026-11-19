// Операції з постачальниками
import {IProduct, ISupplierFull} from "../utils/types";
import {ApiMessageResponse, CreateSupplierResponse, SupplierPurchaseHistoryResponse} from "./contracts";
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";

export const addSupplier = (newSupplier: import("../utils/types").INewSupplier): Promise<CreateSupplierResponse> => {
    return postResource<CreateSupplierResponse>(API_ENDPOINTS.ADD_SUPPLIERS, newSupplier);
};

export const updateSupplier = (supplierId: number, editSupplier: ISupplierFull): Promise<ApiMessageResponse> => {
    return putResource<ApiMessageResponse>(API_ENDPOINTS.EDIT_SUPPLIERS(supplierId), editSupplier);
};

export const fetchGetAllSuppliers = (): Promise<ISupplierFull[]> => {
    return fetchResource<ISupplierFull[]>(API_ENDPOINTS.GET_ALL_SUPPLIERS);
};

export const fetchGetSupplierPurchaseHistory = (supplierId: number): Promise<SupplierPurchaseHistoryResponse> => {
    return fetchResource<SupplierPurchaseHistoryResponse>(API_ENDPOINTS.SUPPLIER_PURCHASE_HISTORY(supplierId));
};

export const fetchGetSupplierProducts = (supplierId: number): Promise<{ supplier: string; products: Array<Pick<IProduct, "id" | "name">> }> => {
    return fetchResource<{ supplier: string; products: Array<Pick<IProduct, "id" | "name">> }>(API_ENDPOINTS.SUPPLIER_PRODUCTS(supplierId));
};

export const deleteSupplier = (supplierId: number): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_SUPPLIER(supplierId));
};
