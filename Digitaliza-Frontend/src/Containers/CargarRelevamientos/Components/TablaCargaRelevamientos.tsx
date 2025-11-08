import { MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import type { IRelevamiento } from "../../../types/relevamientos";
import { createRelevamiento } from "../../../api/relevamientosApi";
import { useRelevamientos } from "../../../hooks/useRelevamientos";
import { TABLE_CREAR_RELEVAMIENTOS } from "../../../constants/tableConfig";
import { TableGeneralStyles, TableLoadingStyles, TableTitleStyles } from "../../../styles/TablasStyle";
import { validateRelevamiento } from "../../../utils/validations";
import { TableButtonCreate } from "./TableButtonCreate";



const TablaCargaRelevamientos = () => {
  const { relevamientos, loading } = useRelevamientos();
  const [data, setData] = useState<IRelevamiento[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setData(relevamientos);
  }, [relevamientos]);

  const handleCreateNewRow: MRT_TableOptions<IRelevamiento>["onCreatingRowSave"] = async ({
    values,
    table,
  }) => {
    const errors = validateRelevamiento(values);
    if (Object.values(errors).some((e) => e)) {
      setValidationErrors(errors);
      return;
    }

    try {
      await createRelevamiento(values);
      table.setCreatingRow(null);
      setValidationErrors({});
    } catch (error) {
      console.error("Error al crear relevamiento:", error);
    }
  };

  const columns: MRT_ColumnDef<IRelevamiento>[] = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      muiEditTextFieldProps: ({ cell }) => ({
        type: "date",
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
      }),
    },
    {
      accessorKey: "inspector",
      header: "Inspector",
      muiEditTextFieldProps: ({ cell }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
      }),
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      muiEditTextFieldProps: ({ cell }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
      }),
    },
    {
      accessorKey: "rubro",
      header: "Rubro",
      muiEditTextFieldProps: ({ cell }) => ({
        error: !!validationErrors[cell.column.id],
        helperText: validationErrors[cell.column.id],
      }),
    },
  ];

  const table = useMaterialReactTable({
    ...TABLE_CREAR_RELEVAMIENTOS,
    columns,
    data,
    initialState: {
      columnVisibility: { id: false },
    },
    editDisplayMode: "row",
    enableEditing: (row: MRT_Row<IRelevamiento>) => row.original.id === 0,
    onCreatingRowSave: handleCreateNewRow,
    renderTopToolbarCustomActions: ({ table }) => (
      <TableButtonCreate table={table} />
    ),
  });

  if (loading) return <Typography sx={TableLoadingStyles}>Cargando relevamientos...</Typography>;

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
        <Typography sx={TableTitleStyles}>Creación de relevamiento</Typography>
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaCargaRelevamientos;