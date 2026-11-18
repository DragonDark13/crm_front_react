// src/api/investmentsApi.ts
import {API_ENDPOINTS, deleteResource, fetchResource, postResource} from "./api";
import {INewInvestment, Investment} from "../utils/types";

export const getAllInvestments = (): Promise<Investment[]> => {
  return fetchResource<Investment[]>(API_ENDPOINTS.GET_ALL_INVESTMENTS);
};

export const createInvestment = (newInvestment: INewInvestment): Promise<void> => {
  return postResource<void>(API_ENDPOINTS.CREATE_NEW_INVESTMENT, newInvestment);
};

export const deleteInvestmentById = (id: number): Promise<void> => {
  return deleteResource<void>(API_ENDPOINTS.DELETE_INVESTMENT(id));
};

export const deleteAllInvestments = (): Promise<{ message: string }> => {
  return deleteResource<{ message: string }>(API_ENDPOINTS.DELETE_ALL_INVESTMENTS);
};
