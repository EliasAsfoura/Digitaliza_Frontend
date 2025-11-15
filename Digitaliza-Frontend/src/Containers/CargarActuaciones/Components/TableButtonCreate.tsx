import { Button } from "@mui/material";
import { createRow } from "material-react-table";

export const TableButtonCreate = ({ table }: any) => {
    return(
        <Button
        variant="contained"
        sx={{
          backgroundColor: "#0166FF",
          color: "white",
          fontFamily: "Tactic Sans",
          textTransform: "none",
        }}
         onClick={() =>table.setCreatingRow(true)}
      >
        Crear Actuacion
      </Button>
    )
}