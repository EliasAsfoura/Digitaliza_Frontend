// DashboardChart.tsx
import { Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { ActuacionesPorMesItem } from "../../../api/dashboardApi";

type Props = {
  data: ActuacionesPorMesItem[];
};

const DashboardChart = ({ data }: Props) => {
  return (
    <Card sx={{ borderRadius: 3, width: { sm: "550px", md: "800px" } }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Actuaciones por mes
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="actu" stroke="#1976d2" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
