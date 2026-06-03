import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { Download, Trophy, FileBarChart } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import {
  getChildReportData,
  parseReportWindow,
  type ReportRange,
} from "@/lib/reports/data";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";

export const metadata: Metadata = { title: "Relatório individual" };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-bold text-foreground">{value}</p>
    </div>
  );
}

export default async function RelatorioCriancaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const win = parseReportWindow(sp);
  const data = await getChildReportData(session, id, win);
  if (!data) notFound();

  const qs = new URLSearchParams();
  qs.set("range", win.range);
  if (win.range === "custom") {
    if (win.from) qs.set("from", win.from);
    if (win.to) qs.set("to", win.to);
  }
  const pdfHref = `/relatorios/crianca/${id}/pdf?${qs.toString()}`;
  const maxTimeline = Math.max(1, ...data.timeline.map((p) => p.value));

  return (
    <>
      <PageHeader
        title={`Relatório · ${data.child.name}`}
        description="Pré-visualização do relatório. Baixe o PDF para impressão ou apresentação."
        action={
          <a
            href={pdfHref}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Download className="h-4 w-4" /> Baixar PDF
          </a>
        }
      />

      <div className="mb-4">
        <ReportFilterBar
          range={win.range as ReportRange}
          from={win.from}
          to={win.to}
        />
      </div>

      {/* Identificação */}
      <Card className="mb-4">
        <CardTitle className="mb-4">Identificação</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Criança"
            value={`${data.child.name}, ${data.child.age} anos`}
          />
          <Field
            label="Nível de suporte"
            value={
              data.child.supportLevel
                ? `TEA Nível ${data.child.supportLevel}`
                : "Não informado"
            }
          />
          <Field label="Tempo de acompanhamento" value={data.accompanied} />
          <Field label="Responsável" value={data.guardians} />
          <Field label="Terapeuta" value={data.therapistName} />
          <Field label="Período" value={data.window.label} />
        </div>
      </Card>

      {/* Destaques */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { v: `${data.child.overallEvolution}%`, l: "Evolução geral" },
          { v: data.sessionsCompleted, l: "Sessões realizadas" },
          { v: data.achievements.length, l: "Conquistas" },
          { v: data.sessionsInRange, l: "Sessões no período" },
        ].map((s) => (
          <Card key={s.l} className="text-center">
            <p className="text-3xl font-extrabold text-brand-600">{s.v}</p>
            <p className="text-xs text-slate-500">{s.l}</p>
          </Card>
        ))}
      </div>

      {/* Métricas */}
      <Card className="mb-4">
        <CardTitle className="mb-4">Indicadores de desenvolvimento</CardTitle>
        <div className="space-y-3">
          {data.metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="w-40 text-sm font-semibold text-foreground">
                {m.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.value}%`, backgroundColor: m.color }}
                />
              </div>
              <span className="w-20 text-right text-sm text-slate-500">
                {m.value}%
                {m.trend !== 0 && (
                  <span
                    className={
                      (m.lowerIsBetter ? m.trend <= 0 : m.trend >= 0)
                        ? "ml-1 text-emerald-600"
                        : "ml-1 text-red-500"
                    }
                  >
                    {m.trend > 0 ? "+" : ""}
                    {m.trend}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Evolução temporal (barras simples) */}
      <Card className="mb-4">
        <CardTitle className="mb-4">Evolução temporal — {data.window.label}</CardTitle>
        {data.timeline.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Sem registros no período.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-2">
            {data.timeline.map((p, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-500"
                    style={{ height: `${(p.value / maxTimeline) * 100}%` }}
                    title={`${p.label}: ${p.value}%`}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{p.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conquistas + Histórico */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warm-500" /> Conquistas recentes
          </CardTitle>
          {data.achievements.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma conquista registrada.</p>
          ) : (
            <ul className="space-y-2">
              {data.achievements.map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {a.icon} {a.title}
                  </span>
                  <span className="text-xs text-slate-400">{a.earnedAt}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-3 flex items-center gap-2">
            <FileBarChart className="h-4 w-4 text-brand-500" /> Histórico resumido
          </CardTitle>
          {data.records.length === 0 ? (
            <p className="text-sm text-slate-400">
              Sem registros de evolução no período.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.records.map((r, i) => (
                <li key={i} className="py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {r.moodEmoji} {r.date}
                    </span>
                    <Badge tone="trust">{r.category}</Badge>
                  </div>
                  {r.note && (
                    <p className="mt-1 text-xs text-slate-500">{r.note}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
