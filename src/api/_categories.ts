// Операції з категоріями
import {API_ENDPOINTS, fetchResource, postResource} from "./api";
import {ICategory} from "../utils/types.ts";

export const fetchGetAllCategories = (): Promise<ICategory[]> => {
    return fetchResource<ICategory[]>(API_ENDPOINTS.CATEGORIES);
};

export const addNewCategory = (name: string): Promise<{ message: string; category: { id: number; name: string } }> => {
    return postResource<{ message: string; category: { id: number; name: string } }>(API_ENDPOINTS.ADD_NEW_CATEGORIES, {name});
};

