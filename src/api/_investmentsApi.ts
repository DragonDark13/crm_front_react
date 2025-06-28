// src/api/investmentsApi.ts
import {API_ENDPOINTS, axiosInstance} from "./api";
import {INewInvestment, Investment} from "../utils/types";

export const getAllInvestments = async (): Promise<Investment[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.GET_ALL_INVESTMENTS)
;
  return response.data;
};

export const createInvestment = async (newInvestment: INewInvestment): Promise<void> => {
  await axiosInstance.post(API_ENDPOINTS.CREATE_NEW_INVESTMENT, newInvestment);
};

export const deleteInvestmentById = async (id: number): Promise<void> => {
  await axiosInstance.delete(API_ENDPOINTS.DELETE_INVESTMENT(id));
};

export const deleteAllInvestments = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(API_ENDPOINTS.DELETE_ALL_INVESTMENTS);
  return response.data;
};
