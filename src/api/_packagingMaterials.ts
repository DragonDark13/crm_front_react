// Операції з пакувальними матеріалами
import {IMaterial, IPurchasePackagingMaterial, ISupplierFull, PackagingMaterialHistory} from "../utils/types";
import {API_ENDPOINTS, axiosInstance, fetchResource, handleError, postResource} from "./api";
import {AxiosResponse} from "axios";

export const fetchListPackagingMaterials = (): Promise<IMaterial[]> => {
    return fetchResource<IMaterial[]>(API_ENDPOINTS.GET_ALL_PACKAGING_MATERIALS);
};

export const getCurrentPackagingHistory = (materialId: number): Promise<PackagingMaterialHistory> => {
    return fetchResource<PackagingMaterialHistory>(API_ENDPOINTS.CURRENT_PACKAGING_HISTORY(materialId));
};

export const updatePackagingSupplier = (packagingSupplierId: number, editPackagingSupplier: ISupplierFull): Promise<AxiosResponse> => {
    return axiosInstance.put(API_ENDPOINTS.EDIT_PACKAGING_SUPPLIER(packagingSupplierId), editPackagingSupplier).catch(handleError);
};

export const fetchGetPackagingSupplierPurchaseHistory = (pack_supplierId: number): Promise<{ supplier: ISupplierFull, purchase_history: any[]; materials: IMaterial[] }> => {
    return fetchResource<{ supplier: ISupplierFull, purchase_history: any[]; materials: IMaterial[] }>(API_ENDPOINTS.CURRENT_PACKAGING_SUPPLIER_PURCHASE_HISTORY(pack_supplierId));
};

export const deletePackagingSupplier = (supplierPackagingId: number): Promise<void> => {
    return axiosInstance
        .delete(API_ENDPOINTS.DELETE_PACKAGING_SUPPLIER(supplierPackagingId))
        .then(() => console.log(`Supplier with ID ${supplierPackagingId} deleted successfully.`))
        .catch(handleError);
};


export const addNewPackagingMaterial = (addNewPackaging: IPurchasePackagingMaterial): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.ADD_NEW_PACKAGING_MATERIAL, {
        name: addNewPackaging.name,
        supplier_id: addNewPackaging.supplier_id,
        quantity_purchased: addNewPackaging.quantity_purchased,
        purchase_price_per_unit: addNewPackaging.purchase_price_per_unit,
        total_purchase_cost: addNewPackaging.total_purchase_cost,
    });

}