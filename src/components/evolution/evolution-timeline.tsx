"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface TimelinePoint {
  label: string;
  Comunicação: number;
  "Interação social": number;
  Sono: number;
  Desempenho: number;
}

const SERIES: { key: keyof Omit<TimelinePoint, "label">; color: string }[] = [
  { key: "Comunicação", color: "#3a6fe0" },
  { key: "Interação social", color: "#1cab88" },
  { key: "Sono", color: "#9b5bef" },
  { key: "Desempenho", color: "#f0a73a" },
];

export function EvolutionTimeline({ data }: { data: TimelinePoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6ebf0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={{ stroke: "#e6ebf0" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e6ebf0",
              fontSize: 12,
            }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
