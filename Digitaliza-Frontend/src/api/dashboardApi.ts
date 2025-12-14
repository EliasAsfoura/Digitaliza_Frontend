// src/api/dashboardApi.ts
import { apiClient } from "./apiClient";

export type DashboardResumen = {
  actuaciones: number;
  relevamientos: number;
  pendientes: number;
  vinculacionActaPendiente: number;
  vinculacionOficioPendiente: number;
};

export type ActuacionesPorMesItem = {
  mes: number;   // 1..12
  actu: number;
};

export type RubroClausuraItem = {
  rubro: string;
  clausuras: number;
};

export const getDashboardResumen = async (): Promise<DashboardResumen> => {
  const { data } = await apiClient.get("/dashboard/resumen");
  return data;
};

export const getActuacionesPorMes = async (anio: number): Promise<ActuacionesPorMesItem[]> => {
  const { data } = await apiClient.get("/dashboard/actuaciones-por-mes", {
    params: { anio },
  });
  return data;
};

export const getRubrosClausura = async (anio: number): Promise<RubroClausuraItem[]> => {
  const { data } = await apiClient.get("/dashboard/rubros-clausura", {
    params: { anio },
  });
  return data;
};
