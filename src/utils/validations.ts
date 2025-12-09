import type { IActuacion } from "../types/actuaciones";
import type { IRelevamiento } from "../types/relevamientos";

// -------------------------
// Helpers base
// -------------------------
const isRequired = (value: unknown) =>
  typeof value === "string"
    ? value.trim().length > 0
    : value !== undefined && value !== null;

// para validar números SOLO si vienen
const isOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return true;
  return !isNaN(Number(value));
};

const isNumber = (value: unknown) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  !isNaN(Number(value));

// Fecha YYYY-MM-DD (input type="date")
const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const isValidRealDate = (value: string) => {
  const d = new Date(value);
  return !isNaN(d.getTime()) && value === d.toISOString().split("T")[0];
};
const hasValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true; // numbers, booleans, etc.
};


// -------------------------
// Validaciones Actuaciones
// (Fiel a tu Pydantic actual)
// -------------------------
export const validateActuacion = (a: Partial<IActuacion>) => {
  const errors: Record<string, string | undefined> = {};

  // 0) Base obligatorios reales del schema
  if (!isRequired(a.orden_trabajo_numero))
    errors.orden_trabajo_numero = "Número OT requerido";

  if (!isRequired(a.fecha_actuacion))
    errors.fecha_actuacion = "Fecha requerida";

  // Fecha del front viene YYYY-MM-DD
  if (a.fecha_actuacion && typeof a.fecha_actuacion === "string") {
    if (!isValidDate(a.fecha_actuacion)) {
      errors.fecha_actuacion = "Formato inválido (YYYY-MM-DD)";
    } else if (!isValidRealDate(a.fecha_actuacion)) {
      errors.fecha_actuacion = "Fecha inválida";
    }
  }

  // 1) Regla de "fila vacía" (como tu back)
  // Si no hay nada más cargado y no hay contraproducencia => error
  const hay_algo_mas = Boolean(
  a.rubro_nombre ||
    a.inspector1 ||
    a.inspector2 ||
    a.inspector3 ||
    a.calle ||
    a.numero ||
    a.tipo_actuacion ||
    a.doc_nro ||
    a.contrib_apellido ||
    a.contrib_nombre ||
    a.acta_inspeccion_num ||
    a.acta_notificacion_num ||
    a.notificacion_motivo_1 ||
    a.notificacion_motivo_2 ||
    a.notificacion_motivo_3 ||
    a.acta_comprobacion_num ||
    a.comprobacion_motivo ||
    a.acta_clausura_num ||
    a.acta_decomiso_num ||
    hasValue(a.decomiso_kilos_total) ||
    hasValue(a.expediente_numero) || // string igual sirve
    hasValue(a.expediente_anio) ||
    hasValue(a.oficio_numero) ||
    hasValue(a.oficio_anio) ||
    hasValue(a.oficio_causa) ||
    a.notificacion_previa_num ||
    a.comprobacion_previa_num
);


  if (!hay_algo_mas && !isRequired(a.contraproducencia)) {
    errors.contraproducencia =
      "Si la fila está vacía, debés cargar una contraproducencia";
  }

  // 2) Contribuyente mínimo
  const hay_contrib =
    isRequired(a.doc_nro) ||
    isRequired(a.contrib_apellido) ||
    isRequired(a.contrib_nombre);

  if (hay_contrib && !isRequired(a.doc_nro)) {
    errors.doc_nro = "Si cargás contribuyente, el documento es obligatorio";
  }

  // 3) Domicilio coherente
  const hayAlgoDomicilio = isRequired(a.calle) || isRequired(a.numero);

  if (hayAlgoDomicilio && (!isRequired(a.calle) || !isRequired(a.numero))) {
    errors.calle = "Si cargás domicilio, completá calle y número";
    errors.numero = "Si cargás domicilio, completá calle y número";
  }

  // Si hay domicilio completo, tu back exige rubro + doc_nro
  if (isRequired(a.calle) && isRequired(a.numero)) {
    if (!isRequired(a.rubro_nombre)) {
      errors.rubro_nombre = "Si cargás domicilio, el rubro es obligatorio";
    }
    if (!isRequired(a.doc_nro)) {
      errors.doc_nro =
        "Si cargás domicilio, el documento del contribuyente es obligatorio";
    }
  }

  // 4) Notificación coherente
  const tiene_motivo_notif =
    isRequired(a.notificacion_motivo_1) ||
    isRequired(a.notificacion_motivo_2) ||
    isRequired(a.notificacion_motivo_3);

  if (isRequired(a.acta_notificacion_num) && !tiene_motivo_notif) {
    errors.notificacion_motivo_1 =
      "Si cargás acta de notificación, indicá al menos 1 motivo";
  }

  if (tiene_motivo_notif && !isRequired(a.acta_notificacion_num)) {
    errors.acta_notificacion_num =
      "Si cargás motivos de notificación, debés indicar el número de acta";
  }

  // 5) Comprobación coherente
  if (isRequired(a.acta_comprobacion_num) && !isRequired(a.comprobacion_motivo)) {
    errors.comprobacion_motivo =
      "Si cargás acta de comprobación, el motivo es obligatorio";
  }

  if (isRequired(a.comprobacion_motivo) && !isRequired(a.acta_comprobacion_num)) {
    errors.acta_comprobacion_num =
      "Si cargás motivo de comprobación, debés indicar el número de acta";
  }

  // 6) Decomiso coherente
  if (isRequired(a.acta_decomiso_num) && !isRequired(a.decomiso_kilos_total)) {
    errors.decomiso_kilos_total =
      "Si cargás acta de decomiso, debés indicar kilos totales";
  }

  // 7) Expediente coherente
  const hay_expediente =
    isRequired(a.expediente_numero) ||
    isRequired(a.expediente_anio);

  if (hay_expediente) {
    if (!isRequired(a.expediente_numero) || !isRequired(a.expediente_anio)) {
      errors.expediente_numero =
        "Si cargás expediente, número y año son obligatorios";
      errors.expediente_anio =
        "Si cargás expediente, número y año son obligatorios";
    }
  }

  // 8) Oficio coherente
  // (causa es opcional en DB según tu decisión)
  const hay_oficio =
    isRequired(a.oficio_numero) ||
    isRequired(a.oficio_anio) ||
    isRequired(a.oficio_causa);

  if (hay_oficio) {
    if (!isRequired(a.oficio_numero) || !isRequired(a.oficio_anio)) {
      errors.oficio_numero = "Si cargás oficio, número y año son obligatorios";
      errors.oficio_anio = "Si cargás oficio, número y año son obligatorios";
    }

    if (!isRequired(a.comprobacion_previa_num)) {
      errors.comprobacion_previa_num =
        "Si cargás oficio, debés indicar el acta de comprobación previa";
    }
  }

  // -------------------------
  // Validaciones numéricas suaves
  // (CORRECCIÓN CLAVE)
  // No explota cuando vienen "" al principio
  // -------------------------
  if (!isOptionalNumber(a.decomiso_kilos_total))
    errors.decomiso_kilos_total = "Kilos debe ser numérico";

  if (!isOptionalNumber(a.expediente_anio))
    errors.expediente_anio = "Año inválido";

  if (!isOptionalNumber(a.oficio_anio))
    errors.oficio_anio = "Año inválido";

  // (opcional extra por si te llega string raro)
  // Esto solo aplica si realmente está presente como valor
  if (isRequired(a.decomiso_kilos_total) && !isNumber(a.decomiso_kilos_total))
    errors.decomiso_kilos_total = "Kilos debe ser numérico";

  if (isRequired(a.expediente_anio) && !isNumber(a.expediente_anio))
    errors.expediente_anio = "Año inválido";

  if (isRequired(a.oficio_anio) && !isNumber(a.oficio_anio))
    errors.oficio_anio = "Año inválido";

  return errors;
};

// -------------------------
// Validaciones Relevamientos
// -------------------------
export const validateRelevamiento = (r: IRelevamiento) => {
  const errors: Record<string, string | undefined> = {};

  if (!isValidDate(r.fecha))
    errors.fecha = "Formato de fecha incorrecto (YYYY-MM-DD)";

  if (!isValidRealDate(r.fecha))
    errors.fecha = "Fecha inválida";

  if (!isRequired(r.inspector))
    errors.inspector = "Ingresa un inspector";

  if (!isRequired(r.direccion))
    errors.direccion = "Dirección requerida";

  if (!isRequired(r.rubro))
    errors.rubro = "Rubro requerido";

  return errors;
};

