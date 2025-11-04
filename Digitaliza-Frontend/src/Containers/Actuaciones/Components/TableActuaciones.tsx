import { Box, Button, Typography } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { useEditableTable } from "../../../hooks/useEditableTable";
import { useDeleteRow } from "../../../hooks/useDeleteRowTable";
import { BASE_TABLE_CONFIG } from "../../../constants/tableConfig";
import { data as initialData } from "../../../data/personData";
import type { IPerson } from "../../../types/Person";
import {
  TableGeneralStyles,
  TableTitleStyles,
} from "../../../styles/TablasStyle";
import { exportVisibleRows, exportAllData } from "../../../utils/exportToCsv";

const TablaActuaciones = () => {
  const { data, handleUpdate } = useEditableTable<IPerson>(initialData);

  const columns: MRT_ColumnDef<IPerson>[] = [
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
        onBlur: (e) =>
          handleUpdate(row.index, "distrito", Number(e.target.value)),
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
        onBlur: (e) => handleUpdate(row.index, "clausuras", e.target.value),
      }),
    },
  ];

  const table = useMaterialReactTable({
    ...BASE_TABLE_CONFIG,
    columns,
    data,
    enableRowSelection: true,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}>
        <Button
          onClick={() => exportAllData(data)}
          startIcon={<FileDownloadIcon />}
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
        >
          Exportar seleccionados
        </Button>

        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => exportVisibleRows(table.getRowModel().rows, table)}
          startIcon={<FileDownloadIcon />}
        >
          Exportar página
        </Button>
      </Box>
    ),
  });
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={TableGeneralStyles}>
        <Typography sx={TableTitleStyles}>Gestión de Actuaciones</Typography>
        <MaterialReactTable table={table} />
      </Box>
    </Box>
  );
};

export default TablaActuaciones;
