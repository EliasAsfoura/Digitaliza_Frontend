import { useEffect, useState } from "react";
import { usePendientesVincOficio } from "../../../../../hooks/usePendientesVincOficio";
import type { IActuacion } from "../../../../../types/actuaciones";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { BASE_TABLE_CONFIG } from "../../../../../constants/tableConfig";
import { TablaExportButtons } from "../../../Components/TableButtons";
import {
  TableGeneralStyles,
  TableLoadingStyles,
  TableTitleStyles,
} from "../../../../../styles/TablasStyle";
import { Box, Typography } from "@mui/material";
import CardsExpedientes from "../../../Components/CardsExpedientes";
import BasicModal from "./ModalPendientesOficio";

const TablaPendientesVinculacionOficio = () => {

  // ✅ Hook correcto:
  const { pendientes, loading } = usePendientesVincOficio();

  const [data, setData] = useState<IActuacion[]>([]);

  useEffect(() => {
    setData(pendientes ?? []);
  }, [pendientes]);

  // ✅ SOLO columnas necesarias para esta vista
  const columns: MRT_ColumnDef<IActuacion>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      enableEditing: false,
      enableClickToCopy: true,
    },
    {
      accessorKey: "orden_trabajo_numero",
      header: "OT",
      enableEditing: false,
    },
    {
      accessorKey: "fecha_actuacion",
      header: "Fecha",
      enableEditing: false,
    },
    {
      accessorKey: "acta_comprobacion_num",
      header: "Acta Comprobación",
      enableEditing: false,
    },
    {
      accessorKey: "expediente_numero",
      header: "Expediente",
      enableEditing: false,
    },
    {
      accessorKey: "expediente_anio",
      header: "Año de Expediente",
      enableEditing: false,
    },
  ];

  const table = useMaterialReactTable({
    ...BASE_TABLE_CONFIG,
    columns,
    data,

    // ✅ en esta vista solo mostramos, nada de editar todavía
    enableEditing: false,

    initialState: {
      columnVisibility: {
        id: false, // mantenemos tu criterio
      },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <TablaExportButtons data={data} table={table} />
    ),
  });

  if (loading)
    return (
      <Typography sx={TableLoadingStyles}>
        Cargando Pendientes...
      </Typography>
    );

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
          Gestión de Pendientes de Vinculacion con Oficio
        </Typography>

        <CardsExpedientes />
        <BasicModal />

        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaPendientesVinculacionOficio;
