export const BASE_TABLE_CONFIG = {
  enableEditing: true,
  editDisplayMode: "cell" as const,
  enableFullScreenToggle: false,
  enableDensityToggle: false,
  enableSelectAll: true,
  enableGrouping: true,
  enableRowSelection: true,
  muiTopToolbarProps: {
    sx: { backgroundColor: "#2B2E34" },
  },
  muiBottomToolbarProps: {
    sx: { backgroundColor: "#2B2E34" },
  },
  muiTableHeadCellProps: {
    sx: {
      color: "#0166FF",
      fontWeight: "Bold",
      fontSize: "16px",
      fontFamily: "tactic sans",
    },
  },
  muiTableContainerProps: {
    sx: { maxHeight: { xs: "550px", sm: "300px", md: "250px", lg: "350px", xl: "500px" }, overflowY: "auto", },
  },
};

