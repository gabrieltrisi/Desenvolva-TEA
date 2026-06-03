import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";
import { calcAge } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export type PeriodKey = "30" | "90" | "365" | "custom";
export type LevelFilter = "all" | "1" | "2" | "3" | "none";
export type StatusFilter = "all" | "active" | "inactive";

export interface MunicipioFilters {
  period: PeriodKey;
  from: string;
  to: string;
  level: LevelFilter;
  status: StatusFilter;
  start: Date;
  end: Date;
  periodLabel: string;
}

export function parseMunicipioFilters(sp: {
  period?: string;
  from?: string;
  to?: string;
  level?: string;
  status?: string;
}): MunicipioFilters {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const period: PeriodKey =
    sp.period === "30" || sp.period === "365" || sp.period === "custom"
      ? (sp.period as PeriodKey)
      : "90";
  const level: LevelFilter = ["1", "2", "3", "none"].includes(sp.level ?? "")
    ? (sp.level as LevelFilter)
    : "all";
  const status: StatusFilter = ["active", "inactive"].includes(sp.status ?? "")
    ? (sp.status as StatusFilter)
    : "all";

  let start: Date;
  let periodLabel: string;
  let realEnd = end;
  if (period === "custom") {
    const f = sp.from ? new Date(sp.from) : null;
    const t = sp.to ? new Date(sp.to) : null;
    start = f && !isNaN(f.getTime()) ? f : new Date(now.getTime() - 90 * DAY_MS);
    if (t && !isNaN(t.getTime()))
      realEnd = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59);
    periodLabel = `${start.toLocaleDateString("pt-BR")} a ${realEnd.toLocaleDateString("pt-BR")}`;
  } else {
    const days = period === "30" ? 30 : period === "365" ? 365 : 90;
    start = new Date(now.getTime() - (days - 1) * DAY_MS);
    start.setHours(0, 0, 0, 0);
    periodLabel = `Últimos ${days} dias`;
  }

  return {
    period,
    from: sp.from ?? "",
    to: sp.to ?? "",
    level,
    status,
    start,
    end: realEnd,
    periodLabel,
  };
}

export interface MunicipioCards {
  totalChildren: number;
  activeFamilies: number;
  professionals: number;
  evolutionRecords: number;
  contentsConsumed: number;
  avgEvolution: number;
  reportsEmitted: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface MunicipioTableRow {
  id: string;
  name: string;
  age: number;
  avatarColor: string;
  teaLevel: string;
  guardian: string;
  therapist: string;
  evolution: number;
  lastRecord: string | null;
  active: boolean;
  recordCount: number;
  contentCount: number;
}

function teaLevelLabel(level: number | null): string {
  return level ? `Nível ${level}` : "Não informado";
}

export interface MunicipioData {
  filters: MunicipioFilters;
  cards: MunicipioCards;
  charts: {
    evolutionByMonth: ChartPoint[];
    ageBuckets: ChartPoint[];
    weeklyUsage: ChartPoint[];
    teaLevels: ChartPoint[];
    topContents: ChartPoint[];
  };
  rows: MunicipioTableRow[];
  generatedAt: string;
}

function ageBucket(age: number): string {
  if (age <= 3) return "0–3";
  if (age <= 6) return "4–6";
  if (age <= 9) return "7–9";
  if (age <= 12) return "10–12";
  return "13+";
}

const composite = (r: {
  communication: number;
  social: number;
  sleep: number;
  performance: number;
  feeding: number;
}) =>
  Math.round(
    ((r.communication + r.social + r.sleep + r.performance + r.feeding) / 5) * 20,
  );

export async function getMunicipioData(
  session: SessionPayload,
  filters: MunicipioFilters,
): Promise<MunicipioData> {
  const organizationId = session.organizationId;
  const now = Date.now();
  const sixMonthsAgo = new Date(now - 182 * DAY_MS);
  const eightWeeksAgo = new Date(now - 56 * DAY_MS);

  const [
    totalChildren,
    activeFamilies,
    professionals,
    evolutionRecords,
    contentsConsumed,
    avgAgg,
    reportsEmitted,
    children,
    recordsHalfYear,
    lastRecords,
    levelGroups,
    topContentGroups,
    recordCountsByChild,
    contentCountsByChild,
  ] = await Promise.all([
    prisma.child.count({ where: { organizationId } }),
    prisma.user.count({ where: { organizationId, role: "FAMILIA", active: true } }),
    prisma.user.count({ where: { organizationId, role: "PROFISSIONAL", active: true } }),
    prisma.evolutionRecord.count({
      where: { child: { organizationId }, date: { gte: filters.start, lte: filters.end } },
    }),
    prisma.contentView.count({
      where: { organizationId, viewedAt: { gte: filters.start, lte: filters.end } },
    }),
    prisma.child.aggregate({ where: { organizationId }, _avg: { overallEvolution: true } }),
    prisma.reportEmission.count({ where: { organizationId } }),
    prisma.child.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        birthDate: true,
        supportLevel: true,
        overallEvolution: true,
        avatarColor: true,
        therapist: { select: { name: true } },
        guardians: { select: { name: true }, take: 1 },
      },
    }),
    prisma.evolutionRecord.findMany({
      where: { child: { organizationId }, date: { gte: sixMonthsAgo } },
      select: {
        date: true,
        communication: true,
        social: true,
        sleep: true,
        performance: true,
        feeding: true,
      },
    }),
    prisma.evolutionRecord.groupBy({
      by: ["childId"],
      where: { child: { organizationId } },
      _max: { date: true },
    }),
    prisma.child.groupBy({
      by: ["supportLevel"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.contentView.groupBy({
      by: ["contentId"],
      where: { organizationId },
      _count: { _all: true },
      orderBy: { _count: { contentId: "desc" } },
      take: 5,
    }),
    prisma.evolutionRecord.groupBy({
      by: ["childId"],
      where: { child: { organizationId }, date: { gte: filters.start, lte: filters.end } },
      _count: { _all: true },
    }),
    prisma.contentView.groupBy({
      by: ["childId"],
      where: { organizationId, childId: { not: null }, viewedAt: { gte: filters.start, lte: filters.end } },
      _count: { _all: true },
    }),
  ]);

  const recordCountMap = new Map(
    recordCountsByChild.map((r) => [r.childId, r._count._all]),
  );
  const contentCountMap = new Map(
    contentCountsByChild.map((r) => [r.childId, r._count._all]),
  );

  // --- Gráfico: evolução média por mês (últimos 6 meses) ---
  const monthAgg = new Map<string, { sum: number; n: number; order: number }>();
  for (const r of recordsHalfYear) {
    const key = `${r.date.getFullYear()}-${r.date.getMonth()}`;
    const cur = monthAgg.get(key) ?? {
      sum: 0,
      n: 0,
      order: r.date.getFullYear() * 12 + r.date.getMonth(),
    };
    cur.sum += composite(r);
    cur.n += 1;
    monthAgg.set(key, cur);
  }
  const evolutionByMonth: ChartPoint[] = [...monthAgg.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, v]) => ({
      label: MONTHS_PT[Number(key.split("-")[1])],
      value: Math.round(v.sum / v.n),
    }));

  // --- Gráfico: utilização por semana (últimas 8 semanas) ---
  const weekCounts = new Array(8).fill(0);
  for (const r of recordsHalfYear) {
    if (r.date < eightWeeksAgo) continue;
    const idx = Math.min(7, Math.floor((now - r.date.getTime()) / (7 * DAY_MS)));
    weekCounts[7 - idx] += 1;
  }
  const weeklyUsage: ChartPoint[] = weekCounts.map((value, i) => ({
    label: `S${i + 1}`,
    value,
  }));

  // --- Gráfico: faixa etária ---
  const buckets = ["0–3", "4–6", "7–9", "10–12", "13+"];
  const ageMap = new Map(buckets.map((b) => [b, 0]));
  for (const c of children) {
    const b = ageBucket(calcAge(c.birthDate));
    ageMap.set(b, (ageMap.get(b) ?? 0) + 1);
  }
  const ageBuckets: ChartPoint[] = buckets.map((b) => ({
    label: b,
    value: ageMap.get(b) ?? 0,
  }));

  // --- Gráfico: distribuição por nível TEA ---
  const teaLevels: ChartPoint[] = ["1", "2", "3", "none"].map((lvl) => {
    const match = levelGroups.find((g) =>
      lvl === "none" ? g.supportLevel == null : g.supportLevel === Number(lvl),
    );
    return {
      label: lvl === "none" ? "Não informado" : `Nível ${lvl}`,
      value: match?._count._all ?? 0,
    };
  });

  // --- Gráfico: conteúdos mais acessados ---
  const contentTitles = await prisma.content.findMany({
    where: { id: { in: topContentGroups.map((g) => g.contentId) } },
    select: { id: true, title: true },
  });
  const titleMap = new Map(contentTitles.map((c) => [c.id, c.title]));
  const topContents: ChartPoint[] = topContentGroups.map((g) => ({
    label: titleMap.get(g.contentId) ?? "—",
    value: g._count._all,
  }));

  // --- Tabela ---
  const lastMap = new Map(
    lastRecords.map((l) => [l.childId, l._max.date ?? null]),
  );
  const activeWindowStart = filters.start;
  let rows: MunicipioTableRow[] = children.map((c) => {
    const last = lastMap.get(c.id) ?? null;
    const active = last != null && last >= activeWindowStart;
    return {
      id: c.id,
      name: c.name,
      age: calcAge(c.birthDate),
      avatarColor: c.avatarColor,
      teaLevel: teaLevelLabel(c.supportLevel),
      guardian: c.guardians[0]?.name ?? "—",
      therapist: c.therapist?.name ?? "—",
      evolution: c.overallEvolution,
      lastRecord: last ? last.toLocaleDateString("pt-BR") : null,
      active,
      recordCount: recordCountMap.get(c.id) ?? 0,
      contentCount: contentCountMap.get(c.id) ?? 0,
    };
  });

  if (filters.level !== "all") {
    rows = rows.filter((r) => {
      const c = children.find((ch) => ch.id === r.id)!;
      return filters.level === "none"
        ? c.supportLevel == null
        : c.supportLevel === Number(filters.level);
    });
  }
  if (filters.status !== "all") {
    rows = rows.filter((r) =>
      filters.status === "active" ? r.active : !r.active,
    );
  }

  return {
    filters,
    cards: {
      totalChildren,
      activeFamilies,
      professionals,
      evolutionRecords,
      contentsConsumed,
      avgEvolution: Math.round(avgAgg._avg.overallEvolution ?? 0),
      reportsEmitted,
    },
    charts: { evolutionByMonth, ageBuckets, weeklyUsage, teaLevels, topContents },
    rows,
    generatedAt: new Date().toLocaleString("pt-BR"),
  };
}

// ---------------------------------------------------------------------------
// Comparativo do período (atual vs. período anterior equivalente)
// ---------------------------------------------------------------------------

export type TrendDirection = "up" | "down" | "flat";

export interface ComparisonMetric {
  key: string;
  label: string;
  current: number;
  previous: number;
  delta: number;
  pct: number | null; // null quando o período anterior é 0
  direction: TrendDirection;
  suffix: string;
}

export interface MunicipioComparison {
  currentLabel: string;
  previousLabel: string;
  metrics: ComparisonMetric[];
}

function direction(delta: number): TrendDirection {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

export async function getMunicipioComparison(
  session: SessionPayload,
  filters: MunicipioFilters,
): Promise<MunicipioComparison> {
  const organizationId = session.organizationId;
  const start = filters.start;
  const end = filters.end;
  const durationMs = Math.max(DAY_MS, end.getTime() - start.getTime());
  const prevStart = new Date(start.getTime() - durationMs);

  const [records, views, emissions] = await Promise.all([
    prisma.evolutionRecord.findMany({
      where: { child: { organizationId }, date: { gte: prevStart, lte: end } },
      select: {
        date: true,
        childId: true,
        communication: true,
        social: true,
        sleep: true,
        performance: true,
        feeding: true,
      },
    }),
    prisma.contentView.findMany({
      where: { organizationId, viewedAt: { gte: prevStart, lte: end } },
      select: { viewedAt: true },
    }),
    prisma.reportEmission.findMany({
      where: { organizationId, emittedAt: { gte: prevStart, lte: end } },
      select: { emittedAt: true },
    }),
  ]);

  const curRecords = records.filter((r) => r.date >= start);
  const prevRecords = records.filter((r) => r.date < start);
  const curViews = views.filter((v) => v.viewedAt >= start).length;
  const prevViews = views.filter((v) => v.viewedAt < start).length;
  const curEmissions = emissions.filter((e) => e.emittedAt >= start).length;
  const prevEmissions = emissions.filter((e) => e.emittedAt < start).length;

  const distinct = (rs: { childId: string }[]) =>
    new Set(rs.map((r) => r.childId)).size;

  const metric = (
    key: string,
    label: string,
    current: number,
    previous: number,
    suffix = "",
  ): ComparisonMetric => {
    const delta = current - previous;
    return {
      key,
      label,
      current,
      previous,
      delta,
      pct: previous > 0 ? Math.round((delta / previous) * 100) : null,
      direction: direction(delta),
      suffix,
    };
  };

  return {
    currentLabel: filters.periodLabel,
    previousLabel: "Período anterior equivalente",
    metrics: [
      metric("activeChildren", "Crianças ativas", distinct(curRecords), distinct(prevRecords)),
      metric("records", "Registros de evolução", curRecords.length, prevRecords.length),
      metric("contents", "Conteúdos consumidos", curViews, prevViews),
      metric("avgEvolution", "Evolução média", mean(curRecords.map(composite)), mean(prevRecords.map(composite)), "%"),
      metric("reports", "Relatórios emitidos", curEmissions, prevEmissions),
    ],
  };
}
