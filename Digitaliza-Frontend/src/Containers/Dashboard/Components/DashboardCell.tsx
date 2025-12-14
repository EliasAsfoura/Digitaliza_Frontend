import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell } from "recharts";

import type { RubroClausuraItem } from "../../../api/dashboardApi";

type Props = {
  data: RubroClausuraItem[];
  isAnimationActive?: boolean;
};

const colors = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#ffc658",
];

const renderValueLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#000"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

const renderLabel = (props: any) => {
  const { name, cx, cy, midAngle, innerRadius, outerRadius } = props;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="text-before-edge"
      fontSize={14}
      fontWeight="bold"
    >
      {name}
    </text>
  );
};

const RubrosPieChart = ({ data, isAnimationActive = true }: Props) => {
  // Adaptamos tu tipo real a lo que Recharts espera
  const chartData = (data ?? []).map((x) => ({
    name: x.rubro,       // <- tu API
    value: x.clausuras, // <- tu API
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "500px",
        aspectRatio: 1,
      }}
    >
      <Typography fontSize={"20px"} fontWeight={500} color="#000000de">
        Rubros Clausurados
      </Typography>

      <PieChart
        style={{
          width: "100%",
          maxWidth: "400px",
          aspectRatio: 1,
        }}
      >
        <Pie
          data={chartData}
          dataKey="value"
          label={renderValueLabel}
          labelLine={{ stroke: "#000", strokeWidth: 3 }}
          isAnimationActive={isAnimationActive}
        >
          {chartData.map((_entry, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>

        <Pie
          data={chartData}
          dataKey="value"
          innerRadius={50}
          label={renderLabel}
          isAnimationActive={false}
          fill="transparent"
        />
      </PieChart>
    </Box>
  );
};

export default RubrosPieChart;
