import { CardStyle } from "../../../styles/InicioStyles"
import type { JSX } from "react";
import { Typography, Grid, Box } from '@mui/material';
import GestionarActuaciones from "../assets-inicio/GestionarActuaciones.svg"


const CardsInicio = (): JSX.Element => {

    return (
        <Grid container>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} direction={"column"} sx={CardStyle}>

                <Grid display={"flex"} justifyContent={"center"} alignItems={"center"}>
                    <Box component="img" src={GestionarActuaciones} />
                </Grid>

                <Grid display={"flex"} justifyContent={"center"}>
                    <Typography fontFamily={"tactic sans"}>
                        Gestionar Actuaciones
                    </Typography>
                </Grid>

            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={CardStyle}>
                <Typography>

                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={CardStyle}>
                <Typography>

                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={CardStyle}>
                <Typography>

                </Typography>
            </Grid>
        </Grid>
    );

};

export default CardsInicio;