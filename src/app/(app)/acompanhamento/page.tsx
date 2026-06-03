import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LineChart, Plus } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAccessibleChildren } from "@/lib/evolution/access";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FilterBar,
  type RangeKey,
} from "@/components/evolution/filter-bar";
import {
  EvolutionTimeline,
  type TimelinePoint,
} from "@/components/evolution/evolution-timeline";
import {
  EVOLUTION_CATEGORY_LABELS,
  MOOD_SCALE,
  RATING_FIELDS,
} from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Acompanhamento" };

const DAY_MS = 24 * 60 * 60 * 1000;

function parseRange(sp: { range?: string; from?: string; to?: string }): {
  range: RangeKey;
  start: Date;
  end: Date;
  from: string;
  to: string;
} {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const range: RangeKey =
    sp.range === "week" || sp.range === "custom" ? sp.range : "month";

  if (range === "custom") {
    const f = sp.from ? new Date(sp.from) : null;
    const t = sp.to ? new Date(sp.to) : null;
    const start = f && !isNaN(f.getTime()) ? f : new Date(now.getTime() - 30 * DAY_MS);
    const customEnd =
      t && !isNaN(t.getTime())
        ? new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59)
        : end;
    return {
      range,
      start,
      end: customEnd,
      from: sp.from ?? "",
      to: sp.to ?? "",
    };
  }

  const days = range === "week" ? 7 : 30;
  const start = new Date(now.getTime() - (days - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  return { range, start, end, from: "", to: "" };
}

const moodEmoji = (v: number) =>
  MOOD_SCALE.find((m) => m.value === v)?.emoji ?? "";

function scoreTone(v: number): "success" | "warm" | "neutral" {
  if (v >= 4) return "success";
  if (v >= 3) return "warm";
  return "neutral";
}

export default async function AcompanhamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string; range?: string; from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const children = await getAccessibleChildren(session);
  if (children.length === 0) {
    return (
      <>
        <PageHeader
          title="Acompanhamento de evolução"
          description="Registre e acompanhe a evolução da criança ao longo do tempo."
        />
        <EmptyState
          icon={LineChart}
          title="Nenhuma criança disponível"
          description="Cadastre uma criança para começar o acompanhamento."
        />
      </>
    );
  }

  const sp = await searchParams;
  const child =
    children.find((c) => c.id === sp.childId) ?? children[0];
  const { range, start, end, from, to } = parseRange(sp);

  const records = await prisma.evolutionRecord.findMany({
    where: { childId: child.id, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  // Pontos do gráfico (1–5 → %).
  const points: TimelinePoint[] = records.map((r) => ({
    label: r.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    Comunicação: r.communication * 20,
    "Interação social": r.social * 20,
    Sono: r.sleep * 20,
    Desempenho: r.performance * 20,
  }));

  const recent = [...records].reverse(); // mais novos primeiro na lista

  return (
    <>
      <PageHeader
        title="Acompanhamento de evolução"
        description="Histórico de registros e evolução temporal."
        action={
          <Button asChild>
            <Link href={`/acompanhamento/novo?childId=${child.id}`}>
              <Plus className="h-4 w-4" /> Novo registro
            </Link>
          </Button>
        }
      />

      {/* Seletor de criança */}
      {children.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.id}
              href={`/acompanhamento?childId=${c.id}&range=${range}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                c.id === child.id
                  ? "bg-brand-500 text-white"
                  : "bg-surface text-slate-600 hover:bg-surface-muted",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Evolução temporal</CardTitle>
          <FilterBar range={range} from={from} to={to} />
        </div>
        {points.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            Sem registros neste período.
          </p>
        ) : (
          <EvolutionTimeline data={points} />
        )}
      </Card>

      {/* Lista de registros */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          Registros ({recent.length})
        </h2>
        {recent.length === 0 ? (
          <EmptyState
            icon={LineChart}
            title="Nenhum registro no período"
            description="Ajuste o filtro ou crie um novo registro."
            action={
              <Button asChild>
                <Link href={`/acompanhamento/novo?childId=${child.id}`}>
                  <Plus className="h-4 w-4" /> Novo registro
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" title={`Humor: ${r.mood}/5`}>
                      {moodEmoji(r.mood)}
                    </span>
                    <div>
                      <p className="font-bold text-foreground">
                        {r.date.toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <Badge tone="trust">
                        {EVOLUTION_CATEGORY_LABELS[r.category]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_FIELDS.map((f) => (
                      <span
                        key={f.name}
                        className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2 py-1 text-xs"
                        title={f.label}
                      >
                        <span className="text-slate-500">
                          {f.label.split(" ")[0]}
                        </span>
                        <Badge tone={scoreTone(r[f.name])}>{r[f.name]}/5</Badge>
                      </span>
                    ))}
                  </div>
                </div>
                {r.note && (
                  <p className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-sm text-slate-600">
                    {r.note}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
