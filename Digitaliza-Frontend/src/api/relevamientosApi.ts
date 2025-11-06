// src/api/relevamientosApi.ts
import { apiClient } from "./apiClient";
import { type IRelevamiento } from "../types/relevamientos";

export const getRelevamientos = async (): Promise<IRelevamiento[]> => {
  const { data } = await apiClient.get("/relevamientos");
  return data;
};

export const createRelevamiento = async (body: IRelevamiento): Promise<IRelevamiento> => {
  const { data } = await apiClient.post("/relevamientos", body);
  return data;
};

export const updateRelevamiento = async (id: string, body: IRelevamiento): Promise<IRelevamiento> => {
  const { data } = await apiClient.put(`/relevamientos/${id}`, body);
  return data;
};

export const deleteRelevamiento = async (id: string): Promise<void> => {
  await apiClient.delete(`/relevamientos/${id}`);
};
