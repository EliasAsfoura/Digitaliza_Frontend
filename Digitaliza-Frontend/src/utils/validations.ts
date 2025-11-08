import type { IActuacion } from "../types/actuaciones";
import type { IRelevamiento } from "../types/relevamientos";

export const validateRequired = (v: string) => !!v?.toString().trim();
export const validateNumber = (v: any) => Number.isFinite(Number(v));
export const validateActuacion = (a: Partial<IActuacion>) => {
  const errs: Record<string, string | undefined> = {};
  if (!validateRequired(a.rubro as string)) errs.rubro = "Rubro requerido";
  if (!validateNumber(a.distrito)) errs.distrito = "Distrito inválido";
  if (!validateRequired(a.direccion as string)) errs.direccion = "Dirección requerida";
  if (!validateNumber(a.clausuras)) errs.clausuras = "Clausuras debe ser numérico";
  return errs;
};


const validateRequiredRelevamiento = (value: string) => !!value.length;
const validateDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const validateRelevamiento = (r: IRelevamiento) => ({
  fecha: !validateDate(r.fecha) ? "Formato de fecha incorrecto (YYYY-MM-DD)" : "",
  inspector: !validateRequiredRelevamiento(r.inspector) ? "Ingresa un Inspector" : "",
  direccion: !validateRequiredRelevamiento(r.direccion) ? "Direccion requerida" : "",
  rubro: !validateRequiredRelevamiento(r.rubro) ? "Rubro requerido" : "",
});