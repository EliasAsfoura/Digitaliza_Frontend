import { Box, Typography, IconButton, Tooltip, Alert, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BASE_TABLE_CONFIG } from "../../../constants/tableConfig";
import type { IActuacion, TipoActuacion } from "../../../types/actuaciones";
import {
  TableGeneralStyles,
  TableLoadingStyles,
  TableTitleStyles,
} from "../../../styles/TablasStyle";

import { useGestionActuaciones } from "../../../hooks/useGestionActuaciones";
import {
  deleteActuacion,
  updateActuacion,
  getInspectoresCatalogo,
  getRubrosCatalogo,
  getMotivosCatalogo,
} from "../../../api/actuacionesApi";

import { TablaExportButtons } from "./TableButtons";
import CardsExpedientes from "./CardsExpedientes";

// ---------------------------
// Enums fijos del FRONT (igual que Crear)
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
  const detail =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message;

  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  return "Ocurrió un error al comunicarse con el servidor.";
};

// convierte "" en null para que el backend no reciba strings vacíos
const emptyStringsToNull = <T extends object>(obj: T): T => {
  const result = { ...obj } as any;
  Object.keys(result).forEach((k) => {
    if (result[k] === "") result[k] = null;
  });
  return result;
};

const TablaActuaciones = () => {
  const { actuaciones, setActuaciones, loading } = useGestionActuaciones();

  const [data, setData] = useState<IActuacion[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  // catálogos backend
  const [inspectoresOpts, setInspectoresOpts] = useState<string[]>([]);
  const [rubrosOpts, setRubrosOpts] = useState<string[]>([]);
  const [motivosOpts, setMotivosOpts] = useState<string[]>([]);

  // para evitar spam de PUT si el usuario hace tab rápido
  const lastEditRef = useRef<{ id: number; key: string; value: any } | null>(null);

  useEffect(() => {
    setData(actuaciones ?? []);
  }, [actuaciones]);

  // cargar catálogos
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
        // catálogos no deben romper la tabla
        console.error("Error cargando catálogos", e);
      }
    })();
  }, []);

  // ---------------------------
  // DELETE
  // ---------------------------
  const handleDeleteRow = useCallback(
    async (id: number) => {
      if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;

      const prev = data;

      setData((p) => p.filter((item) => item.id !== id));
      setActuaciones((p) => p.filter((item) => item.id !== id));

      try {
        await deleteActuacion(id);
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el registro. Se restaurará la lista.");
        setData(prev);
        setActuaciones(prev);
      }
    },
    [data, setActuaciones]
  );

  // ---------------------------
  // UPDATE por celda (onBlur global)
  // ---------------------------
  const handleEditCell = useCallback(
    async (id: number, key: keyof IActuacion, value: any) => {
      setServerError(null);

      // Evita re-disparar el mismo update idéntico en una secuencia muy corta
      const last = lastEditRef.current;
      if (last && last.id === id && last.key === key && last.value === value) {
        return;
      }
      lastEditRef.current = { id, key: String(key), value };

      const prevSnapshot = data;

      const idx = data.findIndex((r) => r.id === id);
      if (idx === -1) return;

      const updatedRow = { ...data[idx], [key]: value };

      // optimistic UI
      const optimistic = [...data];
      optimistic[idx] = updatedRow;
      setData(optimistic);
      setActuaciones(optimistic);

      // payload limpio para Pydantic
      const payload = emptyStringsToNull(updatedRow);

      try {
        const updatedFromBack = await updateActuacion(id, payload as IActuacion);

        // sincronizamos con el presenter del backend
        setData((prev) => {
          const i = prev.findIndex((x) => x.id === id);
          if (i === -1) return prev;
          const copy = [...prev];
          copy[i] = updatedFromBack as any;
          return copy;
        });

        setActuaciones((prev) => {
          const i = prev.findIndex((x) => x.id === id);
          if (i === -1) return prev;
          const copy = [...prev];
          copy[i] = updatedFromBack as any;
          return copy;
        });
      } catch (error) {
        console.error("Error al actualizar:", error);
        setServerError(extractBackendError(error));

        // rollback
        setData(prevSnapshot);
        setActuaciones(prevSnapshot);
      }
    },
    [data, setActuaciones]
  );

  // ---------------------------
  // Columnas (mismas que Crear)
  // ---------------------------
  const columns = useMemo<MRT_ColumnDef<IActuacion>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      enableEditing: false,
      enableClickToCopy: true,
      size: 60,
    },

    { accessorKey: "orden_trabajo_numero", header: "OT" },

    {
      accessorKey: "fecha_actuacion",
      header: "Fecha",
      // dejamos input tipo date para UX
      muiEditTextFieldProps: {
        type: "date",
      },
    },

    // Rubro catálogo
    {
      accessorKey: "rubro_nombre",
      header: "Rubro",
      editVariant: "select",
      editSelectOptions: rubrosOpts,
      muiEditTextFieldProps: {
        select: true,
        children: rubrosOpts.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        )),
      },
    },

    // Inspectores catálogo
    {
      accessorKey: "inspector1",
      header: "Inspector 1",
      editVariant: "select",
      editSelectOptions: inspectoresOpts,
      muiEditTextFieldProps: {
        select: true,
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      },
    },
    {
      accessorKey: "inspector2",
      header: "Inspector 2",
      editVariant: "select",
      editSelectOptions: inspectoresOpts,
      muiEditTextFieldProps: {
        select: true,
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      },
    },
    {
      accessorKey: "inspector3",
      header: "Inspector 3",
      editVariant: "select",
      editSelectOptions: inspectoresOpts,
      muiEditTextFieldProps: {
        select: true,
        children: inspectoresOpts.map((n) => (
          <MenuItem key={n} value={n}>
            {n}
          </MenuItem>
        )),
      },
    },

    // Domicilio
    { accessorKey: "calle", header: "Calle" },
    { accessorKey: "numero", header: "Número" },

    // Tipo actuación enum fijo
    {
      accessorKey: "tipo_actuacion",
      header: "Tipo de actuación",
      editVariant: "select",
      editSelectOptions: TIPOS_ACTUACION,
      muiEditTextFieldProps: {
        select: true,
        children: TIPOS_ACTUACION.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        )),
      },
    },

    // Contraproducencia enum fijo
    {
      accessorKey: "contraproducencia",
      header: "Contraproducencia",
      editVariant: "select",
      editSelectOptions: CONTRAPRODUCENCIAS,
      muiEditTextFieldProps: {
        select: true,
        children: CONTRAPRODUCENCIAS.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        )),
      },
    },

    // Contribuyente
    { accessorKey: "doc_nro", header: "Documento" },
    { accessorKey: "contrib_apellido", header: "Apellido" },
    { accessorKey: "contrib_nombre", header: "Nombre" },

    // Actas
    { accessorKey: "acta_inspeccion_num", header: "Acta inspección" },
    { accessorKey: "acta_notificacion_num", header: "Acta notificación" },

    // Motivos notificación catálogo
    {
      accessorKey: "notificacion_motivo_1",
      header: "Motivo notif. 1",
      editVariant: "select",
      editSelectOptions: motivosOpts,
      muiEditTextFieldProps: {
        select: true,
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      },
    },
    {
      accessorKey: "notificacion_motivo_2",
      header: "Motivo notif. 2",
      editVariant: "select",
      editSelectOptions: motivosOpts,
      muiEditTextFieldProps: {
        select: true,
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      },
    },
    {
      accessorKey: "notificacion_motivo_3",
      header: "Motivo notif. 3",
      editVariant: "select",
      editSelectOptions: motivosOpts,
      muiEditTextFieldProps: {
        select: true,
        children: motivosOpts.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      },
    },

    { accessorKey: "acta_comprobacion_num", header: "Acta comprobación" },

    // Motivo comprobación enum fijo
    {
      accessorKey: "comprobacion_motivo",
      header: "Motivo comprobación",
      editVariant: "select",
      editSelectOptions: COMPROBACION_MOTIVOS,
      muiEditTextFieldProps: {
        select: true,
        children: COMPROBACION_MOTIVOS.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        )),
      },
    },

    { accessorKey: "acta_clausura_num", header: "Acta clausura" },
    { accessorKey: "clausura_motivo", header: "Motivo clausura" },

    { accessorKey: "acta_decomiso_num", header: "Acta decomiso" },
    {
      accessorKey: "decomiso_kilos_total",
      header: "KG decomiso",
      muiEditTextFieldProps: { type: "number" },
    },

    // Expediente / Oficio
    { accessorKey: "expediente_numero", header: "Expediente número" },
    {
      accessorKey: "expediente_anio",
      header: "Expediente año",
      muiEditTextFieldProps: { type: "number" },
    },
    { accessorKey: "oficio_numero", header: "Oficio número" },
    {
      accessorKey: "oficio_anio",
      header: "Oficio año",
      muiEditTextFieldProps: { type: "number" },
    },
    { accessorKey: "oficio_causa", header: "Oficio causa" },

    // Previas
    { accessorKey: "notificacion_previa_num", header: "Notif. previa" },
    { accessorKey: "comprobacion_previa_num", header: "Comprob. previa" },
  ], [inspectoresOpts, rubrosOpts, motivosOpts]);

  const table = useMaterialReactTable({
    ...BASE_TABLE_CONFIG,
    columns,
    data,

    enableEditing: true,
    editDisplayMode: "cell",

    // ✅ Opción B: onBlur global para TODAS las celdas
    muiEditTextFieldProps: ({ cell, row }) => ({
      onBlur: (e) => {
        const key = cell.column.id as keyof IActuacion;
        const value = (e.target as HTMLInputElement).value;
        handleEditCell(row.original.id, key, value);
      },
    }),

    enableRowActions: true,

    initialState: {
      columnVisibility: { id: false },
    },

    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Eliminar">
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(Number(row.original.id))}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    renderTopToolbarCustomActions: ({ table }) => (
      <TablaExportButtons data={data} table={table} />
    ),
  });

  if (loading) {
    return (
      <Typography sx={TableLoadingStyles}>
        Cargando actuaciones...
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          ...TableGeneralStyles,
          "& .MuiBox-root.css-wsew38": {
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          },
        }}
      >
        <Typography sx={TableTitleStyles}>Gestión de Actuaciones</Typography>

        {/* Si querés mantener tus cards */}
        <CardsExpedientes />

        {/* Error bonito del backend */}
        {serverError && (
          <Box sx={{ mb: 2, width: "100%" }}>
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

export default TablaActuaciones;
