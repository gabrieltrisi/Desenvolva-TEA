import { ArrowUp, ArrowDown } from "lucide-react";
import type { MetricKey } from "@/generated/prisma/enums";
import { Card } from "@/components/ui/card";
import { METRIC_META } from "./metric-meta";

export function MetricCard({
  metricKey,
  value,
  trend,
}: {
  metricKey: MetricKey;
  value: number;
  trend: number;
}) {
  const meta = METRIC_META[metricKey];
  const Icon = meta.icon;
  // "Bom" = subir (ou descer, quando lowerIsBetter). Define a cor do badge.
  const good = meta.lowerIsBetter ? trend <= 0 : trend >= 0;
  const TrendArrow = trend >= 0 ? ArrowUp : ArrowDown;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-3xl font-extrabold text-foreground">{value}%</span>
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${
            good ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}
        >
          <TrendArrow className="h-3 w-3" />
          {Math.abs(trend)}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: meta.color }}
        />
      </div>
    </Card>
  );
}
