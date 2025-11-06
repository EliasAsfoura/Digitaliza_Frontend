import { Box, 
  Button, 
  Typography, 
  IconButton, 
  Tooltip } 
  from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row } 
   from "material-react-table";
import { useState } from "react";
import { useEditableTable } from "../../../hooks/useEditableTable";
import { BASE_TABLE_CONFIG } from "../../../constants/tableConfig";
import { data as initialData } from "../../../data/actuacionesData";
import type { IActuacion } from "../../../types/actuaciones";
import {
  TableExportBoxStyles,
  TableExportButtonStyles,
  TableGeneralStyles,
  TableTitleStyles,
} from "../../../styles/TablasStyle";
import { exportVisibleRows, exportAllData } from "../../../utils/exportToCsv";

const TablaActuaciones = () => {

  const { data: editableData, handleUpdate } = useEditableTable<IActuacion>(initialData);
  const [data, setData] = useState<IActuacion[]>(editableData);

const handleDeleteRow = async (row: MRT_Row<IActuacion>) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

    try {
      //                    CONEXION CON API FUTURA
      // await deleteActuacion(row.original.id); // si tu backend usa ID
      // const updated = fetchedData.filter((_, index) => index !== row.index);
      // setData(updated);
      const updatedData = data.filter((_, index) => index !== row.index);
      setData(updatedData);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el registro.");
    }
  };

  const columns: MRT_ColumnDef<IActuacion>[] = [
    {
      accessorKey: "rubro",
      header: "Rubro",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) => handleUpdate(row.index, "rubro", e.target.value),
      }),
    },
    {
      accessorKey: "distrito",
      header: "Distrito",
      muiEditTextFieldProps: ({ row }) => ({
        type: "number",
        onBlur: (e) => handleUpdate(row.index, "distrito", Number(e.target.value)),
      }),
    },
    {
      accessorKey: "inspector1",
      header: "Inspector-1",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) => handleUpdate(row.index, "inspector1", e.target.value),
      }),
    },
    {
      accessorKey: "inspector2",
      header: "Inspector-2",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) => handleUpdate(row.index, "inspector2", e.target.value),
      }),
    },
    {
      accessorKey: "inspector3",
      header: "Inspector-3",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) => handleUpdate(row.index, "inspector3", e.target.value),
      }),
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      muiEditTextFieldProps: ({ row }) => ({
        onBlur: (e) => handleUpdate(row.index, "direccion", e.target.value),
      }),
    },
    {
      accessorKey: "clausuras",
      header: "Clausuras",
      muiEditTextFieldProps: ({ row }) => ({
        type: "number",
        onBlur: (e) => handleUpdate(row.index, "clausuras", e.target.value),
      }),
    },
  ];

  const table = useMaterialReactTable({
    ...BASE_TABLE_CONFIG,
    columns,
    data,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Eliminar">
          <IconButton color="error" onClick={() => handleDeleteRow(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={TableExportBoxStyles}>
        <Button
          onClick={() => exportAllData(data)}
          startIcon={<FileDownloadIcon />}
          sx={TableExportButtonStyles}
        >
          Exportar todo
        </Button>

        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() =>
            exportVisibleRows(table.getSelectedRowModel().rows, table)
          }
          startIcon={<FileDownloadIcon />}
          sx={TableExportButtonStyles}
        >
          Exportar seleccionados
        </Button>

        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => exportVisibleRows(table.getRowModel().rows, table)}
          startIcon={<FileDownloadIcon />}
          sx={TableExportButtonStyles}
        >
          Exportar página
        </Button>
      </Box>
    ),
  });

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
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaActuaciones;
