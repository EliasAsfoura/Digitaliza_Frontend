// containers/actuaciones/containers/PendientesVinculacionActa/Componentes/TablaPendientesVinculacionActa.tsx

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import type { IActuacion } from "../../../../../types/actuaciones";
import { BASE_TABLE_CONFIG } from "../../../../../constants/tableConfig";
import { TablaExportButtons } from "../../../Components/TableButtons";

import { Box, Typography } from "@mui/material";
import {
  TableGeneralStyles,
  TableLoadingStyles,
  TableTitleStyles,
} from "../../../../../styles/TablasStyle";

import CardsExpedientes from "../../../Components/CardsExpedientes";
import { useCallback, useEffect, useState } from "react";

// ✅ hook nuevo específico para esta vista
import { usePendientesVincActa } from "../../../../../hooks/usePendientesVincActa";

// ✅ API nueva (POST)
import { createExpedienteDesdeActa } from "../../../../../api/actuacionesApi";

const TablaPendientesVinculacionActa = () => {
  const { pendientes, setPendientes, loading } = usePendientesVincActa();
  const [data, setData] = useState<IActuacion[]>([]);

  useEffect(() => {
    setData(pendientes ?? []);
  }, [pendientes]);

  /**
   * En esta vista:
   * - NO actualizamos actuación por PUT.
   * - Creamos expediente por POST cuando ambos campos están completos.
   * - Si el POST sale OK => removemos la fila.
   */
  const handleEditCell = useCallback(
    async (id: number, key: keyof IActuacion, value: any) => {
      let updatedRow: IActuacion | undefined;

      // 1) update local optimista de la celda
      setData((prev) => {
        const idx = prev.findIndex((r) => r.id === id);
        if (idx === -1) return prev;

        updatedRow = { ...prev[idx], [key]: value };

        const newData = [...prev];
        newData[idx] = updatedRow!;
        return newData;
      });

      if (!updatedRow) return;

      // 2) esperamos hasta tener ambos datos
      const expNum = updatedRow.expediente_numero;
      const expAnio = updatedRow.expediente_anio;

      if (!expNum || !expAnio) {
        // no alert: esperamos el siguiente blur
        return;
      }

      try {
        // 3) POST crear expediente
        await createExpedienteDesdeActa(id, {
          expediente_numero: String(expNum),
          expediente_anio: Number(expAnio),
        });

        // 4) Como ya se vinculó, debe desaparecer de pendientes
        setData((prev) => prev.filter((p) => p.id !== id));
        setPendientes?.((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error al crear expediente:", error);
        alert("No se pudo crear el expediente.");
      }
    },
    [setPendientes]
  );

  // -----------------------------------
  // Columnas (mismo set que venías usando)
  // -----------------------------------
  const columns: MRT_ColumnDef<IActuacion>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      enableEditing: false,
      enableClickToCopy: true,
    },

    { accessorKey: "orden_trabajo_numero", header: "OT", enableEditing: false },
    { accessorKey: "fecha_actuacion", header: "Fecha", enableEditing: false },
    { accessorKey: "rubro_nombre", header: "Rubro", enableEditing: false },
    { accessorKey: "inspector1", header: "Inspector 1", enableEditing: false },
    { accessorKey: "inspector2", header: "Inspector 2", enableEditing: false },
    { accessorKey: "inspector3", header: "Inspector 3", enableEditing: false },
    { accessorKey: "calle", header: "Calle", enableEditing: false },
    { accessorKey: "numero", header: "Numero", enableEditing: false },
    { accessorKey: "tipo_actuacion", header: "Tipo de Actuacion", enableEditing: false },
    { accessorKey: "contraproducencia", header: "Contraproducencia", enableEditing: false },
    { accessorKey: "doc_tipo_codigo", header: "Tipo de Documento", enableEditing: false },
    { accessorKey: "doc_nro", header: "Numero de Documento", enableEditing: false },
    { accessorKey: "contrib_apellido", header: "Apellido Contribuidor", enableEditing: false },
    { accessorKey: "contrib_nombre", header: "Nombre Contribuidor", enableEditing: false },
    { accessorKey: "acta_inspeccion_num", header: "Acta Inspeccion", enableEditing: false },
    { accessorKey: "acta_notificacion_num", header: "Acta Notificacion", enableEditing: false },
    { accessorKey: "notificacion_motivo_1", header: "Motivo 1", enableEditing: false },
    { accessorKey: "notificacion_motivo_2", header: "Motivo 2", enableEditing: false },
    { accessorKey: "notificacion_motivo_3", header: "Motivo 3", enableEditing: false },
    { accessorKey: "acta_comprobacion_num", header: "Acta Comprobacion", enableEditing: false },
    { accessorKey: "comprobacion_motivo", header: "Comprobacion Motivo", enableEditing: false },
    { accessorKey: "acta_clausura_num", header: "Acta Clausura", enableEditing: false },
    { accessorKey: "clausura_motivo", header: "Clausura Motivo", enableEditing: false },
    { accessorKey: "acta_decomiso_num", header: "Acta Decomiso", enableEditing: false },
    { accessorKey: "decomiso_kilos_total", header: "Kilos Decomisados", enableEditing: false },

    // ✅ los únicos editables
    {
      accessorKey: "expediente_numero",
      header: "Expediente",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) =>
          handleEditCell(
            row.original.id,
            "expediente_numero",
            e.target.value
          ),
      }),
    },
    {
      accessorKey: "expediente_anio",
      header: "Año de Expediente",
      muiEditTextFieldProps: ({ row }) => ({
        type: "number",
        onBlur: (e) =>
          handleEditCell(
            row.original.id,
            "expediente_anio",
            Number(e.target.value)
          ),
      }),
    },

    { accessorKey: "oficio_numero", header: "Oficio", enableEditing: false },
    { accessorKey: "oficio_anio", header: "Año de Oficio", enableEditing: false },
    { accessorKey: "oficio_causa", header: "Causa de Oficio", enableEditing: false },
    { accessorKey: "notificacion_previa_num", header: "Notificacion Previa", enableEditing: false },
    { accessorKey: "comprobacion_previa_num", header: "Comprobacion Previa", enableEditing: false },
  ];

  const table = useMaterialReactTable({
    ...BASE_TABLE_CONFIG,
    columns,
    data,

    // ✅ para permitir edición de esas 2 columnas
    enableEditing: true,

    initialState: {
      columnVisibility: {
        id: false,
        rubro_nombre: false,
        inspector1: false,
        inspector2: false,
        inspector3: false,
        tipo_actuacion: false,
        contraproducencia: false,
        doc_tipo_codigo: false,
        doc_nro: false,
        contrib_apellido: false,
        contrib_nombre: false,
        acta_inspeccion_num: false,
        notificacion_motivo_1: false,
        notificacion_motivo_2: false,
        notificacion_motivo_3: false,
        comprobacion_motivo: false,
        acta_clausura_num: false,
        clausura_motivo: false,
        acta_decomiso_num: false,
        decomiso_kilos_total: false,
        oficio_numero: false,
        calle: false,
        numero: false,
        oficio_anio: false,
        oficio_causa: false,
        acta_notificacion_num: false,
        notificacion_previa_num: false,
        comprobacion_previa_num: false,
      },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <TablaExportButtons data={data} table={table} />
    ),
  });

  if (loading) {
    return (
      <Typography sx={TableLoadingStyles}>Cargando Pendientes...</Typography>
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
        <Typography sx={TableTitleStyles}>
          Gestión de Pendientes de Vinculacion con Acta
        </Typography>

        <CardsExpedientes />

        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaPendientesVinculacionActa;
