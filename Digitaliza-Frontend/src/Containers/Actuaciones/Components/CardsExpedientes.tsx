// containers/actuaciones/components/CardsExpedientes.tsx

import { Box, Grid, Typography } from "@mui/material";
import {
  CardExpStyle,
  CardExpStyleRel,
  CardExpStyleVinc,
} from "../../../styles/CardsExpStyles";
import { Link } from "react-router-dom";
import { useCardsActuaciones } from "../../../hooks/useCardsActuaciones";

type CardsExpedientesProps = {
  actuaciones?: number;
  relevamientos?: number;
  pendientes?: number;
  vinculacionActaPendiente?: number;
  vinculacionOficioPendiente?: number;
};

const CardsExpedientes = ({
  actuaciones,
  relevamientos,
  pendientes,
  vinculacionActaPendiente,
  vinculacionOficioPendiente,
}: CardsExpedientesProps) => {
  // ✅ nuevo: si no llegan props, usamos backend
  const { cards } = useCardsActuaciones();

  const valueActuaciones = actuaciones ?? cards.actuaciones ?? 0;
  const valueRelevamientos = relevamientos ?? cards.relevamientos ?? 0;
  const valuePendientes = pendientes ?? cards.pendientes ?? 0;
  const valueVincActa =
    vinculacionActaPendiente ?? cards.vinculacionActaPendiente ?? 0;
  const valueVincOficio =
    vinculacionOficioPendiente ?? cards.vinculacionOficioPendiente ?? 0;

  return (
    <Box margin={"15px"} justifyContent={"center"}>
      <Grid container gap={3}>
        <Link
          to="/actuaciones"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid sx={CardExpStyle}>
            <Typography
              fontFamily={"Tactic Sans"}
              marginTop={"10px"}
              fontWeight={500}
              fontSize={"14px"}
              color="#5B5B5B"
            >
              Actuaciones
            </Typography>
            <Box
              textAlign={"left"}
              marginLeft={"5px"}
              marginTop={"15px"}
              fontSize={"30px"}
            >
              {valueActuaciones}
            </Box>
          </Grid>
        </Link>

        <Link
          to="/relevamientos"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid sx={CardExpStyleRel}>
            <Typography
              fontFamily={"Tactic Sans"}
              marginTop={"10px"}
              fontWeight={500}
              fontSize={"14px"}
              color="#5B5B5B"
            >
              Relevamientos
            </Typography>
            <Box
              textAlign={"left"}
              marginLeft={"5px"}
              marginTop={"15px"}
              fontSize={"30px"}
            >
              {valueRelevamientos}
            </Box>
          </Grid>
        </Link>

        <Link
          to="/pendientes"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid sx={CardExpStyle}>
            <Typography
              fontFamily={"Tactic Sans"}
              marginTop={"10px"}
              fontWeight={500}
              fontSize={"14px"}
              color="#5B5B5B"
            >
              Pendientes
            </Typography>
            <Box
              textAlign={"left"}
              marginLeft={"5px"}
              marginTop={"15px"}
              fontSize={"30px"}
            >
              {valuePendientes}
            </Box>
          </Grid>
        </Link>

        <Link
          to="/pendientesVinculacionActa"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid sx={CardExpStyleVinc}>
            <Typography
              fontFamily={"Tactic Sans"}
              marginTop={"10px"}
              fontWeight={500}
              fontSize={"12px"}
              color="#5B5B5B"
            >
              Vinculacion Acta Pendiente
            </Typography>
            <Box
              textAlign={"left"}
              marginLeft={"5px"}
              marginTop={"0px"}
              fontSize={"30px"}
            >
              {valueVincActa}
            </Box>
          </Grid>
        </Link>

        <Link
          to="/pendientesVinculacionOficio"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Grid sx={CardExpStyleVinc}>
            <Typography
              fontFamily={"Tactic Sans"}
              marginTop={"10px"}
              fontWeight={500}
              fontSize={"12px"}
              color="#5B5B5B"
            >
              Vinculacion Oficio Pendiente
            </Typography>
            <Box
              textAlign={"left"}
              marginLeft={"5px"}
              marginTop={"0px"}
              fontSize={"30px"}
            >
              {valueVincOficio}
            </Box>
          </Grid>
        </Link>
      </Grid>
    </Box>
  );
};

export default CardsExpedientes;
