// Операції з категоріями
import {API_ENDPOINTS, fetchResource, postResource} from "./api";
import {ICategory} from "../utils/types.ts";
import {CreateCategoryResponse} from "./contracts";

export const fetchGetAllCategories = (): Promise<ICategory[]> => {
    return fetchResource<ICategory[]>(API_ENDPOINTS.CATEGORIES);
};

export const addNewCategory = (name: string): Promise<CreateCategoryResponse> => {
    return postResource<CreateCategoryResponse>(API_ENDPOINTS.ADD_NEW_CATEGORIES, {name});
};
