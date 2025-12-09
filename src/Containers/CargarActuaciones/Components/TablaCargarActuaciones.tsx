import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";

import { validateActuacion } from "../../../utils/validations";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createActuacion,
  updateActuacion,
  getInspectoresCatalogo,
  getMotivosCatalogo,
  getRubrosCatalogo,
} from "../../../api/actuacionesApi";

import type { IActuacion, TipoActuacion } from "../../../types/actuaciones";
import {
  Box,
  Typography,
  MenuItem,
  Alert,
} from "@mui/material";
import { TableGeneralStyles, TableTitleStyles } from "../../../styles/TablasStyle";
import { TABLE_CREAR_ACTUACIONES } from "../../../constants/tableConfig";
import { TableButtonCreate } from "../../CargarActuaciones/Components/TableButtonCreate";

// ---------------------------
// Enums fijos del FRONT
// ---------------------------

const TIPOS_ACTUACION: TipoActuacion[] = [
  "INSPECCION",
  "REINSPECCION",
  "RATIFICACION",
  "VERIFICAR E INFORMAR",
];

const CONTRAPRODUCENCIAS = [
  "LOCAL_CERRADO",
  "NO_EXISTE",
  "INCLEMENCIA_TIEMPO",
  "ZONA_ROJA",
  "NO_HUBO",
  "OTROS",
];

// Motivo comprobación FIJO como pediste
const COMPROBACION_MOTIVOS = [
  "Falta de higiene",
  "Mercadería vencida",
  "No permitir la inspección",
  "Decomiso",
];

// tipo flexible para catálogos
type CatalogItem = { id?: number; nombre: string };

// intenta soportar:
// 1) [{id, nombre}, ...]
// 2) ["nombre", ...]
const normalizeCatalogNames = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    if (typeof data[0] === "string") return data as string[];
    return (data as CatalogItem[]).map((x) => x.nombre).filter(Boolean);
  }
  return [];
};

// ---------------------------
// Extrae error del backend
// ---------------------------
const extractBackendError = (err: any): string => {
  // Axios shape usual
  const detail =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message;

  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  return "Ocurrió un error al comunicarse con el servidor.";
};

const TablaCargarActuaciones = () => {

  // errores de validación UI
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  // error general del backend
  const [serverError, setServerError] = useState<string | null>(null);

  // data local de la tabla
  const [data, setData] = useState<IActuacion[]>([]);

  // catálogos que vienen del backend
  const [inspectoresOpts, setInspectoresOpts] = useState<string[]>([]);
  const [rubrosOpts, setRubrosOpts] = useState<string[]>([]);
  const [motivosOpts, setMotivosOpts] = useState<string[]>([]);

  // debounce simple para validar sin molestar tanto
  const debounceRef = useRef<number | null>(null);

  // cargar catálogos al montar
  useEffect(() => {
    (async () => {
      try {
        const [i, r, m] = await Promise.all([
          getInspectoresCatalogo(),
          getRubrosCatalogo(),
          getMotivosCatalogo(),
        ]);

        setInspectoresOpts(normalizeCatalogNames(i));
        setRubrosOpts(normalizeCatalogNames(r));
        setMotivosOpts(normalizeCatalogNames(m));

      } catch (e) {
        console.error("Error cargando catálogos", e);
        // no frenamos la vista por catálogos
      }
    })();
  }, []);

  const handleChangeWithDebounce = (row: any, columnId: string, value: any) => {
    // limpiamos error general cuando el usuario escribe
    if (serverError) setServerError(null);

    row._valuesCache[columnId] = value;

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      validateRow(row);
    }, 250);
  };

  const validateRow = (row: MRT_Row<IActuacion>) => {
    setValidationErrors(validateActuacion(row._valuesCache));
  };

  // convierte "" en null para que el backend no reciba strings vacíos
  const emptyStringsToNull = <T extends object>(obj: T): T => {
    const result = {} as T;
    (Object.keys(obj) as (keyof T)[]).forEach((key) => {
      const v = obj[key];
      result[key] = (v === "" ? (null as any) : v) as T[typeof key];
    });
    return result;
  };

  // ---------------------------
  // CREATE handler
  // ---------------------------
  const handleCreateNewRow: MRT_TableOptions<IActuacion>["onCreatingRowSave"] =
    async ({ values, table }) => {
      setServerError(null);

      const errors = validateActuacion(values as IActuacion);

      if (Object.values(errors).some((e) => e)) {
        setValidationErrors(errors);
        return;
      }

      try {
        const payload = emptyStringsToNull(values as any);
        const nuevaActuacion = await createActuacion(payload);

        table.setCreatingRow(null);
        setValidationErrors({});

        // sumamos al estado local
        setData((prev) => [...prev, nuevaActuacion as any]);

        // vuelve a abrir fila
        setTimeout(() => table.setCreatingRow(true), 50);

      } catch (error) {
        const msg = extractBackendError(error);
        setServerError(msg);
        console.error("❌ Error en creación:", error);
      }
    };

  // ---------------------------
  // UPDATE handler (primer editar)
  // ---------------------------
  const handleEditRowSave: MRT_TableOptions<IActuacion>["onEditingRowSave"] =
  async ({ values, table, row }) => {
    setServerError(null);

    const errors = validateActuacion(values as IActuacion);

    if (Object.values(errors).some((e) => e)) {
      setValidationErrors(errors);
      return;
    }

    try {
      const payload = emptyStringsToNull(values as any);

      // ✅ ahora el update necesita id + body
      const updated = await updateActuacion(row.original.id, payload as any);

      setData((prev) => {
        const idx = prev.findIndex((x) => x.id === row.original.id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = updated as any;
        return copy;
      });

      table.setEditingRow(null);
      setValidationErrors({});

    } catch (error) {
      const msg = extractBackendError(error);
      setServerError(msg);
      console.error("❌ Error en actualización:", error);
    }
  };


  // ---------------------------
  // Columnas
  // ---------------------------
  const columns = useMemo<MRT_ColumnDef<IActuacion>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableEditing: false,
    },

    {
      accessorKey: "orden_trabajo_numero",
      header: "OT",
      muiEditTextFieldProps: ({ cell, row }) => ({
        autoFocus: cell.column.id === "orden_trabajo_numero",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    {
      accessorKey: "fecha_actuacion",
      header: "Fecha",
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "date",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // ---------------------------
    // Rubro desde catálogo DB
    // ---------------------------
    {
      accessorKey: "rubro_nombre",
      header: "Rubro",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: rubrosOpts.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        )),
      }),
    },

    // ---------------------------
    // Inspectores desde catálogo DB
    // ---------------------------
    {
      accessorKey: "inspector1",
      header: "Inspector 1",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      }),
    },
    {
      accessorKey: "inspector2",
      header: "Inspector 2",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      }),
    },
    {
      accessorKey: "inspector3",
      header: "Inspector 3",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      }),
    },

    // ---------------------------
    // Domicilio
    // ---------------------------
    {
      accessorKey: "calle",
      header: "Calle",
      muiEditTextFieldProps: ({ cell, row }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "numero",
      header: "Número",
      muiEditTextFieldProps: ({ cell, row }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // ---------------------------
    // Tipo actuación (enum fijo)
    // ---------------------------
    {
      accessorKey: "tipo_actuacion",
      header: "Tipo de actuación",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: TIPOS_ACTUACION.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        )),
      }),
    },

    // ---------------------------
    // Contraproducencia (enum fijo)
    // ---------------------------
    {
      accessorKey: "contraproducencia",
      header: "Contraproducencia",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: CONTRAPRODUCENCIAS.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        )),
      }),
    },

    // ---------------------------
    // Contribuyente
    // ---------------------------
    {
      accessorKey: "doc_nro",
      header: "Documento",
      muiEditTextFieldProps: ({ cell, row }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "contrib_apellido",
      header: "Apellido",
      muiEditTextFieldProps: ({ cell, row }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "contrib_nombre",
      header: "Nombre",
      muiEditTextFieldProps: ({ cell, row }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // ---------------------------
    // Actas
    // ---------------------------
    {
      accessorKey: "acta_inspeccion_num",
      header: "Acta inspección",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    {
      accessorKey: "acta_notificacion_num",
      header: "Acta Notificación",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // Motivos notificación desde catálogo DB
    {
      accessorKey: "notificacion_motivo_1",
      header: "Motivo Notificación 1",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      }),
    },
    {
      accessorKey: "notificacion_motivo_2",
      header: "Motivo Notificación 2",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      }),
    },
    {
      accessorKey: "notificacion_motivo_3",
      header: "Motivo Notificación 3",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      }),
    },

    {
      accessorKey: "acta_comprobacion_num",
      header: "Acta Comprobación",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // Motivo comprobación enum FIJO
    {
      accessorKey: "comprobacion_motivo",
      header: "Motivo Comprobación",
      muiEditTextFieldProps: ({ cell, row }) => ({
        select: true,
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
        children: COMPROBACION_MOTIVOS.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      }),
    },

    {
      accessorKey: "acta_clausura_num",
      header: "Acta Clausura",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "clausura_motivo",
      header: "Motivo Clausura",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    {
      accessorKey: "acta_decomiso_num",
      header: "Acta Decomiso",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "decomiso_kilos_total",
      header: "KG Decomiso",
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "number",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // ---------------------------
    // Expediente/Oficio
    // ---------------------------
    {
      accessorKey: "expediente_numero",
      header: "Expediente Número",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "expediente_anio",
      header: "Expediente Año",
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "number",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    {
      accessorKey: "oficio_numero",
      header: "Oficio Número",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "oficio_anio",
      header: "Oficio Año",
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "number",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "oficio_causa",
      header: "Oficio Causa",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },

    // previas
    {
      accessorKey: "notificacion_previa_num",
      header: "Notificación Previa",
      muiEditTextFieldProps: ({ cell, row }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),
      }),
    },
    {
      accessorKey: "comprobacion_previa_num",
      header: "Comprobación Previa",
      muiEditTextFieldProps: ({ row, cell, table }) => ({
        onChange: (e) =>
          handleChangeWithDebounce(row, cell.column.id, e.target.value),

        // ENTER guarda (create)
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            table.options.onCreatingRowSave?.({
              values: row.getAllCells().reduce((acc, c) => {
                acc[c.column.id] = row._valuesCache[c.column.id];
                return acc;
              }, {} as any),
              table,
            } as any);
          }
        },
      }),
    },
  ], [validationErrors, inspectoresOpts, rubrosOpts, motivosOpts]);

  const table = useMaterialReactTable({
  ...TABLE_CREAR_ACTUACIONES,
  columns,
  data,
  enableEditing: true,
  editDisplayMode: "row",
  enableRowActions: true,

  onCreatingRowSave: handleCreateNewRow,

  onEditingRowSave: async ({ values, row, table }) => {
    try {
      const updated = await updateActuacion(row.original.id, values as IActuacion);

      setData(prev => {
        const idx = prev.findIndex(x => x.id === row.original.id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = updated as any;
        return copy;
      });

      table.setEditingRow(null);
    } catch (e) {
      console.error(e);
    }
  },

 
  initialState: {
    columnVisibility: { id: false },
  },

  renderTopToolbarCustomActions: ({ table }) => (
    <TableButtonCreate table={table} />
  ),
});


  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ ...TableGeneralStyles }}>

        <Typography sx={TableTitleStyles}>Creación de actuación</Typography>

        {/* Error bonito del backend */}
        {serverError && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" onClose={() => setServerError(null)}>
              {serverError}
            </Alert>
          </Box>
        )}

        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaCargarActuaciones;
