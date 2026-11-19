import {API_ENDPOINTS, deleteResource, fetchResource, postResource} from "./api";
import {INewInvestment, Investment} from "../utils/types";
import {ApiMessageResponse} from "./contracts";

export const getAllInvestments = (signal?: AbortSignal): Promise<Investment[]> => {
  const config = signal ? {signal} : {};
  return fetchResource<Investment[]>(API_ENDPOINTS.GET_ALL_INVESTMENTS, config);
};

export const createInvestment = (newInvestment: INewInvestment): Promise<ApiMessageResponse> => {
  return postResource<ApiMessageResponse>(API_ENDPOINTS.CREATE_NEW_INVESTMENT, newInvestment);
};

export const deleteInvestmentById = (id: number): Promise<ApiMessageResponse> => {
  return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_INVESTMENT(id));
};

export const deleteAllInvestments = (): Promise<ApiMessageResponse> => {
  return deleteResource<ApiMessageResponse>(API_ENDPOINTS.DELETE_ALL_INVESTMENTS);
};
