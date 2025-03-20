// Операції з категоріями
import {API_ENDPOINTS, fetchResource, postResource} from "./api";

export const fetchGetAllCategories = (): Promise<string[]> => {
    return fetchResource<string[]>(API_ENDPOINTS.CATEGORIES);
};

export const addNewCategory = (name: string): Promise<{ message: string; category: { id: number; name: string } }> => {
    return postResource<{ message: string; category: { id: number; name: string } }>(API_ENDPOINTS.ADD_NEW_CATEGORIES, {name});
};

