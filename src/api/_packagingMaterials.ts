// Операції з пакувальними матеріалами
import {IMaterial, IPurchasePackagingMaterial, ISupplierFull, PackagingMaterialHistory, IPackagingSupplierPurchaseHistoryResponse} from "../utils/types";
import {ApiMessageResponse, PackagingMaterialResponse, PackagingSupplierResponse} from "./contracts";
import {API_ENDPOINTS, deleteResource, fetchResource, postResource, putResource} from "./api";

export const fetchListPackagingMaterials = (): Promise<IMaterial[]> => {
    return fetchResource<IMaterial[]>(API_ENDPOINTS.GET_ALL_PACKAGING_MATERIALS);
};

export const getCurrentPackagingHistory = (materialId: number): Promise<PackagingMaterialHistory> => {
    return fetchResource<PackagingMaterialHistory>(API_ENDPOINTS.CURRENT_PACKAGING_HISTORY(materialId));
};

export const updatePackagingSupplier = (packagingSupplierId: number, editPackagingSupplier: ISupplierFull): Promise<ApiMessageResponse> => {
    return putResource<ApiMessageResponse>(API_ENDPOINTS.EDIT_PACKAGING_SUPPLIER(packagingSupplierId), editPackagingSupplier);
};

export const fetchGetPackagingSupplierPurchaseHistory = (pack_supplierId: number): Promise<IPackagingSupplierPurchaseHistoryResponse> => {
    return fetchResource<IPackagingSupplierPurchaseHistoryResponse>(API_ENDPOINTS.CURRENT_PACKAGING_SUPPLIER_PURCHASE_HISTORY(pack_supplierId));
};

export const deletePackagingSupplier = (supplierPackagingId: number): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_PACKAGING_SUPPLIER(supplierPackagingId));
};

export const fetchPackagingSuppliers = (signal?: AbortSignal): Promise<PackagingSupplierResponse[]> => {
    const config = signal ? {signal} : {};
    return fetchResource<PackagingSupplierResponse[]>(API_ENDPOINTS.PACKAGING_SUPPLIERS, config);
};

export const addPackagingSupplier = (name: string, contactInfo: string): Promise<PackagingSupplierResponse> => {
    return postResource<PackagingSupplierResponse>(API_ENDPOINTS.ADD_PACKAGING_SUPPLIER, {
        name,
        contact_info: contactInfo,
    });
};

export const updatePackagingStatus = (materialId: number, quantityUsed: number): Promise<PackagingMaterialResponse> => {
    return postResource<PackagingMaterialResponse>(API_ENDPOINTS.UPDATE_PACKAGING_STATUS, {
        material_id: materialId,
        quantity_used: quantityUsed,
    });
};

export interface IPurchaseCurrentPackagingData {
    material_id: number;
    supplier_id: number | null;
    quantity: number;
    purchase_price_per_unit: number;
    total_purchase_cost: number;
}

export const purchaseCurrentPackaging = (purchaseData: IPurchaseCurrentPackagingData): Promise<PackagingMaterialResponse> => {
    return postResource<PackagingMaterialResponse>(API_ENDPOINTS.PURCHASE_CURRENT_PACKAGING, purchaseData);
};

export const deleteAllPackagingMaterials = (): Promise<ApiMessageResponse> => {
    return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_ALL_MATERIALS);
};

export const addNewPackagingMaterial = (addNewPackaging: IPurchasePackagingMaterial): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.ADD_NEW_PACKAGING_MATERIAL, {
        name: addNewPackaging.name,
        supplier_id: addNewPackaging.supplier_id,
        quantity_purchased: addNewPackaging.quantity_purchased,
        purchase_price_per_unit: addNewPackaging.purchase_price_per_unit,
        total_purchase_cost: addNewPackaging.total_purchase_cost,
    });
};
