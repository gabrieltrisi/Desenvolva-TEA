"use client";

import { useState } from "react";
import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  label: string;
  value: number;
}

export type EvolutionData = {
  WEEK: ChartPoint[];
  MONTH: ChartPoint[];
  YEAR: ChartPoint[];
};

const PERIODS: { key: keyof EvolutionData; label: string }[] = [
  { key: "WEEK", label: "Semanal" },
  { key: "MONTH", label: "Mensal" },
  { key: "YEAR", label: "Anual" },
];

const BAR_COLORS = ["#5b8def", "#34c7a0", "#9b5bef"];

export function EvolutionChart({ data }: { data: EvolutionData }) {
  const [period, setPeriod] = useState<keyof EvolutionData>("WEEK");
  const points = data[period];

  return (
    <Card>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <LineChart className="h-5 w-5 text-brand-500" />
          Histórico de Evolução
        </h3>
        <div className="flex rounded-xl border border-border p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                period === p.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          Sem dados para este período.
        </p>
      ) : (
        <div className="flex h-48 items-end gap-2 sm:gap-3">
          {points.map((point, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(4, point.value)}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                  title={`${point.label}: ${point.value}%`}
                />
              </div>
              <span className="text-xs text-slate-400">{point.label}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
