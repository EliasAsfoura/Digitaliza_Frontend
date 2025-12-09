// src/api/actuacionesApi.ts

import { apiClient } from "./apiClient";
import type { IActuacion, IActuacionListado } from "../types/actuaciones";

// ---------------------------
// Actuaciones
// ---------------------------

export const getActuaciones = async (): Promise<IActuacionListado[]> => {
  const { data } = await apiClient.get("/actuaciones");
  return data;
};

export const createActuacion = async (
  body: IActuacion
): Promise<IActuacionListado> => {
  const { data } = await apiClient.post("/actuaciones", body);
  return data;
};

// ✅ AHORA COINCIDE CON TU BACK: PUT /actuaciones/<id>
export const updateActuacion = async (
  id: number,
  body: Partial<IActuacion>
): Promise<IActuacionListado> => {
  const { data } = await apiClient.put(`/actuaciones/${id}`, body);
  return data;
};

export const deleteActuacion = async (id: number): Promise<void> => {
  await apiClient.delete(`/actuaciones/${id}`);
};

// ---------------------------
// Catálogos
// ---------------------------

type CatalogoItem = { id: number; nombre: string };

export const getInspectoresCatalogo = async (): Promise<CatalogoItem[]> => {
  const { data } = await apiClient.get("/catalogos/inspectores");
  return data;
};

export const getRubrosCatalogo = async (): Promise<CatalogoItem[]> => {
  const { data } = await apiClient.get("/catalogos/rubros");
  return data;
};

export const getMotivosCatalogo = async (): Promise<CatalogoItem[]> => {
  const { data } = await apiClient.get("/catalogos/motivos");
  return data;
};


// Si tu UI necesita SOLO strings:
export const getInspectoresNombres = async (): Promise<string[]> => {
  const data = await getInspectoresCatalogo();
  return data.map((x) => x.nombre);
};

export const getRubrosNombres = async (): Promise<string[]> => {
  const data = await getRubrosCatalogo();
  return data.map((x) => x.nombre);
};

export const getMotivosNombres = async (): Promise<string[]> => {
  const data = await getMotivosCatalogo();
  return data.map((x) => x.nombre);
};

