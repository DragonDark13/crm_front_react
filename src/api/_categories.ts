// Операції з категоріями
import {API_ENDPOINTS, fetchResource, postResource} from "./api";

export const fetchGetAllCategories = (): Promise<string[]> => {
    return fetchResource<string[]>(API_ENDPOINTS.CATEGORIES);
};

export const addNewCategory = (name: string): Promise<void> => {
    return postResource<void>(API_ENDPOINTS.CATEGORIES, {name});
};
