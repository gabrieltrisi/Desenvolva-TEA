import Link from "next/link";
import {
  Baby,
  BookOpen,
  PlusCircle,
  LineChart,
  FileBarChart,
  TrendingUp,
  ClipboardList,
  Route as RouteIcon,
  CalendarClock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";
import {
  getAccessibleChildrenWhere,
  resolveAccessUser,
} from "@/lib/access/children";
import { calcAge, cn, currentDate, daysAgo, yearsSince } from "@/lib/utils";
import { EVOLUTION_CATEGORY_LABELS } from "@/lib/labels";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  EvolutionChart,
  type EvolutionData,
} from "@/components/dashboard/evolution-chart";
import { METRIC_ORDER } from "@/components/dashboard/metric-meta";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function sessionLabel(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getHours()}h`;
}

/** Índice composto de um registro de evolução (1–5 → 0–100). */
function composite(r: {
  communication: number;
  social: number;
  sleep: number;
  performance: number;
  feeding: number;
}): number {
  return Math.round(
    ((r.communication + r.social + r.sleep + r.performance + r.feeding) / 5) * 20,
  );
}

export async function FamilyDashboard({
  session,
  selectedChildId,
}: {
  session: SessionPayload;
  selectedChildId?: string;
}) {
  const user = await resolveAccessUser(session);

  // Apenas crianças vinculadas via ChildGuardianLink ACTIVE (helper central).
  const children = await prisma.child.findMany({
    where: getAccessibleChildrenWhere(user),
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      avatarColor: true,
      birthDate: true,
      supportLevel: true,
      overallEvolution: true,
      accompaniedSince: true,
      planActive: true,
      therapist: { select: { name: true } },
      mainResponsible: { select: { name: true } },
      guardianLinks: {
        where: { status: "ACTIVE" },
        select: { guardian: { select: { name: true } } },
        take: 1,
      },
    },
  });

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Baby}
        title="Nenhuma criança vinculada ainda"
        description="Aguarde o vínculo feito pelo administrador. Assim que uma criança for vinculada ao seu perfil, o painel de acompanhamento aparecerá aqui."
      />
    );
  }

  const child =
    children.find((c) => c.id === selectedChildId) ?? children[0];

  const weekAgo = daysAgo(7);
  const [
    recordsCount,
    latestRecord,
    recentRecords,
    enrollAgg,
    contentViews,
    completedSessions,
    nextSession,
    achievementsCount,
    xpAgg,
    evoPoints,
    metrics,
  ] = await Promise.all([
    prisma.evolutionRecord.count({ where: { childId: child.id } }),
    prisma.evolutionRecord.findFirst({
      where: { childId: child.id },
      orderBy: { date: "desc" },
      select: {
        date: true,
        communication: true,
        social: true,
        sleep: true,
        performance: true,
        feeding: true,
      },
    }),
    prisma.evolutionRecord.findMany({
      where: { childId: child.id },
      orderBy: { date: "desc" },
      take: 5,
      select: { id: true, date: true, category: true, note: true },
    }),
    prisma.trackEnrollment.aggregate({
      where: { childId: child.id },
      _avg: { progress: true },
      _count: { _all: true },
    }),
    prisma.contentView.count({ where: { childId: child.id } }),
    prisma.therapySession.count({
      where: { childId: child.id, status: "COMPLETED" },
    }),
    prisma.therapySession.findFirst({
      where: {
        childId: child.id,
        status: "SCHEDULED",
        scheduledAt: { gte: currentDate() },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.achievement.count({ where: { childId: child.id } }),
    prisma.xpEvent.aggregate({
      where: { childId: child.id, createdAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
    prisma.evolutionPoint.findMany({
      where: { childId: child.id },
      orderBy: { order: "asc" },
    }),
    prisma.childMetric.findMany({ where: { childId: child.id } }),
  ]);

  const responsavel =
    child.mainResponsible?.name ??
    child.guardianLinks[0]?.guardian.name ??
    null;
  const accompaniedYears = child.accompaniedSince
    ? yearsSince(child.accompaniedSince)
    : null;
  const enrollmentsCount = enrollAgg._count._all;
  const avgTrackProgress =
    enrollAgg._avg.progress != null ? Math.round(enrollAgg._avg.progress) : null;
  const weeklyXp = xpAgg._sum.amount ?? 0;

  const chartData: EvolutionData = { WEEK: [], MONTH: [], YEAR: [] };
  for (const p of evoPoints) chartData[p.period].push({ label: p.label, value: p.value });
  const hasChart = evoPoints.length > 0;

  const metricMap = new Map(metrics.map((m) => [m.key, m]));
  const hasMetrics = metrics.length > 0;

  const NEXT_STEPS = [
    { icon: BookOpen, title: "Explorar conteúdos", hint: "Vídeos e materiais por especialidade", href: "/conteudos" },
    { icon: PlusCircle, title: "Registrar evolução", hint: "Anote um momento do dia a dia", href: `/acompanhamento/novo?childId=${child.id}` },
    { icon: LineChart, title: "Acompanhamento", hint: "Veja a linha do tempo", href: `/acompanhamento?childId=${child.id}` },
    { icon: FileBarChart, title: "Relatório da criança", hint: "Gerar PDF", href: `/relatorios/crianca/${child.id}` },
  ];

  return (
    <div className="space-y-6">
      {/* Seletor de criança (quando há mais de um vínculo ativo) */}
      {children.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="Selecionar criança">
          {children.map((c) => {
            const active = c.id === child.id;
            return (
              <Link
                key={c.id}
                href={`/dashboard?childId=${c.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border bg-white text-slate-600 hover:bg-surface-muted",
                )}
              >
                <Avatar name={c.name} color={c.avatarColor} className="h-6 w-6 text-[10px]" />
                {c.name}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Hero premium da criança (dados reais) */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-pine via-brand-700 to-brand-500 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-start gap-5">
            <Avatar name={child.name} color={child.avatarColor} className="h-20 w-20 text-2xl" />
            <div className="min-w-0">
              <h2 className="text-3xl font-bold leading-tight text-white">
                {child.name}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                {[
                  `${calcAge(child.birthDate)} anos`,
                  child.supportLevel ? `TEA Nível ${child.supportLevel}` : null,
                  responsavel ? `Responsável: ${responsavel}` : null,
                  child.therapist?.name ? `Terapeuta: ${child.therapist.name}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {child.planActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Plano ativo
                  </span>
                )}
                {nextSession && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Sessão {sessionLabel(nextSession.scheduledAt)}
                  </span>
                )}
                {accompaniedYears != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                    <Trophy className="h-3.5 w-3.5" aria-hidden /> {accompaniedYears} ano
                    {accompaniedYears === 1 ? "" : "s"} de acompanhamento
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:w-96">
            {[
              { v: `${child.overallEvolution}%`, l: "Evolução geral" },
              { v: String(recordsCount), l: recordsCount === 1 ? "Registro" : "Registros" },
              { v: String(completedSessions), l: "Sessões" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/12 px-3 py-3 text-center backdrop-blur">
                <p className="text-2xl font-bold leading-tight text-white">{s.v}</p>
                <p className="text-[11px] font-medium text-white/75">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de resumo (todos com dados reais ou fallback honesto) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Progresso geral</p>
          <p className="text-2xl font-bold text-ink">{child.overallEvolution}%</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.min(100, Math.max(0, child.overallEvolution))}%` }}
            />
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-50 text-trust-600">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Registros</p>
          <p className="text-2xl font-bold text-ink">{recordsCount}</p>
          <p className="text-xs text-slate-500">
            {latestRecord
              ? `Último em ${latestRecord.date.toLocaleDateString("pt-BR")}`
              : "Nenhum registro recente"}
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-100 text-warm-500">
            <RouteIcon className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Trilhas e conteúdos</p>
          <p className="text-2xl font-bold text-ink">{enrollmentsCount}</p>
          <p className="text-xs text-slate-500">
            {avgTrackProgress != null
              ? `${avgTrackProgress}% médio · ${contentViews} acessos`
              : `${contentViews} conteúdos acessados`}
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-soft text-amber-700">
            <LineChart className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Última evolução</p>
          {latestRecord ? (
            <>
              <p className="text-2xl font-bold text-ink">{composite(latestRecord)}%</p>
              <p className="text-xs text-slate-500">{latestRecord.date.toLocaleDateString("pt-BR")}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-400">Ainda sem dados</p>
              <p className="text-xs text-slate-500">Comece registrando uma evolução</p>
            </>
          )}
        </Card>
      </div>

      {/* Gráfico de evolução (real) — só quando há histórico */}
      {hasChart && <EvolutionChart data={chartData} />}

      {/* Métricas do painel (reais) */}
      {hasMetrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRIC_ORDER.map((key) => {
            const m = metricMap.get(key);
            if (!m) return null;
            return <MetricCard key={key} metricKey={key} value={m.value} trend={m.trend} />;
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos passos (links reais, sem hints fictícios) */}
        <Card>
          <CardTitle className="mb-4">Próximos passos</CardTitle>
          <div className="space-y-2">
            {NEXT_STEPS.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.title}
                  href={a.href}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-muted"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-foreground">{a.title}</span>
                    <span className="block text-xs text-slate-500">{a.hint}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Atividades recentes (registros reais) */}
        <Card>
          <CardTitle className="mb-4">Atividades recentes</CardTitle>
          {recentRecords.length === 0 ? (
            <EmptyState
              icon={LineChart}
              title="Nenhum registro recente"
              description="Comece registrando uma evolução para acompanhar o progresso."
            />
          ) : (
            <ul className="divide-y divide-border">
              {recentRecords.map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-600">
                    <LineChart className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="trust">{EVOLUTION_CATEGORY_LABELS[r.category]}</Badge>
                      <span className="text-xs text-slate-400">
                        {r.date.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{r.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {weeklyXp > 0 && (
        <p className="text-center text-xs text-slate-400">
          {weeklyXp} XP registrados nesta semana · {achievementsCount} conquista
          {achievementsCount === 1 ? "" : "s"} no total
        </p>
      )}
    </div>
  );
}
