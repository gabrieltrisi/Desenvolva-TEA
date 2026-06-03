"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartPoint {
  label: string;
  value: number;
}

const AXIS = { fontSize: 11, fill: "#94a3b8" };
const GRID = "#e6ebf0";
const TOOLTIP = {
  contentStyle: { borderRadius: 12, border: "1px solid #e6ebf0", fontSize: 12 },
};

export function MuniLineChart({
  data,
  color = "#128a6e",
}: {
  data: ChartPoint[];
  color?: string;
}) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis domain={[0, 100]} tick={AXIS} tickLine={false} axisLine={false} width={36} />
          <Tooltip {...TOOLTIP} formatter={(v) => `${v}%`} />
          <Line type="monotone" dataKey="value" name="Evolução média" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MuniBarChart({
  data,
  color = "#3a6fe0",
  layout = "vertical",
  suffix = "",
}: {
  data: ChartPoint[];
  color?: string;
  layout?: "vertical" | "horizontal";
  suffix?: string;
}) {
  const horizontal = layout === "horizontal";
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 12, bottom: 0, left: horizontal ? 8 : -18 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            </>
          )}
          <Tooltip {...TOOLTIP} formatter={(v) => `${v}${suffix}`} />
          <Bar dataKey="value" name="Total" fill={color} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["#128a6e", "#3a6fe0", "#9b5bef", "#cbd5e1"];

export function MuniPieChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
