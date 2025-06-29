// Операції з пакувальними матеріалами
import {IMaterial, IProduct, IPurchasePackagingMaterial, ISupplierFull, PackagingMaterialHistory} from "../utils/types";
import {API_ENDPOINTS, fetchResource, postResource} from "./api";

export const fetchListPackagingMaterials = (): Promise<{ materials: IMaterial[] }> => {
    return fetchResource<{ materials: IMaterial[] }>(API_ENDPOINTS.GET_ALL_PACKAGING_MATERIALS);
};

export const getCurrentPackagingHistory = (materialId: number): Promise<PackagingMaterialHistory> => {
    return fetchResource<PackagingMaterialHistory>(API_ENDPOINTS.CURRENT_PACKAGING_HISTORY(materialId));
};

export const fetchGetPackagingSupplierPurchaseHistory = (pack_supplierId: number): Promise<{ supplier: ISupplierFull, purchase_history: any[]; materials: IMaterial[] }> => {
    return fetchResource<{ supplier: ISupplierFull, purchase_history: any[]; materials: IMaterial[] }>(API_ENDPOINTS.CURRENT_PACKAGING_SUPPLIER_PURCHASE_HISTORY(pack_supplierId));
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