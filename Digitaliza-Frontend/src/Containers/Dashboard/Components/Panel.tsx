// containers/dashboard/components/Panel.tsx
import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import DashboardCards from "./DashboardCards";
import DashboardChart from "./DashboardChart";
import RubrosPieChart from "./DashboardCell";
import { exportDashboardToExcel } from "../../../utils/exportExcelDashboard";

import {
  getActuacionesPorMes,
  getDashboardResumen,
  getRubrosClausura,
  type ActuacionesPorMesItem,
  type DashboardResumen,
  type RubroClausuraItem,
} from "../../../api/dashboardApi";

const monthLabel = (m: number) =>
  ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][m - 1] ??
  String(m);

const Panel = () => {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [lineChartData, setLineChartData] = useState<ActuacionesPorMesItem[]>([]);
  const [pieChartData, setPieChartData] = useState<RubroClausuraItem[]>([]);
  const [loading, setLoading] = useState(true);

  // estable
  const anioActual = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [r, line, pie] = await Promise.all([
          getDashboardResumen(),
          getActuacionesPorMes(anioActual),
          getRubrosClausura(anioActual),
        ]);

        setResumen(r ?? null);
        setLineChartData(line ?? []);
        setPieChartData(pie ?? []);
      } catch (e) {
        console.error("Error cargando dashboard", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [anioActual]);

  // ✅ cards reales segun tu nueva API
  const tarjetasData = useMemo(() => {
    return [
      { title: "Actuaciones", value: resumen?.actuaciones ?? 0 },
      { title: "Relevamientos", value: resumen?.relevamientos ?? 0 },
      { title: "Pendientes", value: resumen?.pendientes ?? 0 },
      {
        title: "Vinc. Acta Pend.",
        value: resumen?.vinculacionActaPendiente ?? 0,
      },
      {
        title: "Vinc. Oficio Pend.",
        value: resumen?.vinculacionOficioPendiente ?? 0,
      },
    ];
  }, [resumen]);

  // ✅ SOLO para export: convertimos mes number -> string
  const lineChartExportData = useMemo(() => {
    return (lineChartData ?? []).map((x) => ({
      mes: typeof x.mes === "number" ? monthLabel(x.mes) : String((x as any).mes ?? ""),
      actu: Number(x.actu ?? 0),
    }));
  }, [lineChartData]);

  return (
    <Box p={3} ml={{ xs: 10, sm: 12, md: 20 }}>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography fontSize={{ xs: "25px", sm: "50px" }} fontWeight={800} mb={3}>
          Panel de Control
        </Typography>

        <Button
          sx={{
            height: "50px",
            fontSize: { xs: "10px", sm: "14px" },
            backgroundColor: "#0166FF",
          }}
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={() =>
            exportDashboardToExcel({
              tarjetas: tarjetasData,
              lineChart: lineChartExportData, // ✅ aquí está el fix
              pieChart: pieChartData,
            })
          }
        >
          Descargar Informe
        </Button>
      </Box>

      {/* Tarjetas principales */}
      <Grid container spacing={3} mb={3}>
        {tarjetasData.map((t) => (
          <Grid key={t.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <DashboardCards title={t.title} value={t.value} />
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid
          size={{ xs: 12, md: 12 }}
          display={"flex"}
          flexDirection={{ xs: "column", sm: "column", md: "row" }}
          gap={2}
        >
          {/* ✅ el chart usa el tipo real de API sin conversión */}
          <DashboardChart data={lineChartData} />

          {/* ✅ pie directo */}
          <RubrosPieChart data={pieChartData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Panel;
