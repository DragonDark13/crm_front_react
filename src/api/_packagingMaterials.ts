// Операції з пакувальними матеріалами
import {IMaterial, PackagingMaterialHistory} from "../utils/types";
import {API_ENDPOINTS, fetchResource} from "./api";

export const fetchListPackagingMaterials = (): Promise<{ materials: IMaterial[] }> => {
    return fetchResource<{ materials: IMaterial[] }>(API_ENDPOINTS.GET_ALL_PACKAGING_MATERIALS);
};

export const getCurrentPackagingHistory = (materialId: number): Promise<PackagingMaterialHistory> => {
    return fetchResource<PackagingMaterialHistory>(API_ENDPOINTS.CURRENT_PACKAGING_HISTORY(materialId));
};
