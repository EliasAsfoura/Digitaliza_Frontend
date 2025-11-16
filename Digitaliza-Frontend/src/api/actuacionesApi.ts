// src/api/actuacionesApi.ts
import { apiClient } from "./apiClient";
import type { IActuacion } from "../types/actuaciones";

export const getActuaciones = async (): Promise<IActuacion[]> => {
  const { data } = await apiClient.get("/");
  return data;
};

export const createActuacion = async (data: IActuacion) => {
  // simula un backend que tarda y responde OK
  await new Promise(res => setTimeout(res, 300));
return { ...data };
};


export const updateActuacion = async (id: number, body: IActuacion): Promise<IActuacion> => {
  const { data } = await apiClient.put(`/actuaciones/${id}`, body);
  return data;
};

export const deleteActuacion = async (id: number): Promise<void> => {
  await apiClient.delete(`/actuaciones/${id}`);
};
