import "server-only";
import { prisma } from "@/lib/prisma";
import { canAccessChild } from "@/lib/evolution/access";
import type { SessionPayload } from "@/lib/auth/session";
import { calcAge } from "@/lib/utils";
import {
  DOMAIN_LABELS,
  EVOLUTION_CATEGORY_LABELS,
  MOOD_SCALE,
} from "@/lib/labels";
import { METRIC_META, METRIC_ORDER } from "@/components/dashboard/metric-meta";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportRange = "30" | "90" | "custom";

export interface ReportWindow {
  range: ReportRange;
  start: Date;
  end: Date;
  from: string;
  to: string;
  label: string;
}

/** Resolve a janela do relatório a partir dos search params. */
export function parseReportWindow(sp: {
  range?: string;
  from?: string;
  to?: string;
}): ReportWindow {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const range: ReportRange =
    sp.range === "90" || sp.range === "custom" ? sp.range : "30";

  if (range === "custom") {
    const f = sp.from ? new Date(sp.from) : null;
    const t = sp.to ? new Date(sp.to) : null;
    const start =
      f && !isNaN(f.getTime()) ? f : new Date(now.getTime() - 30 * DAY_MS);
    const customEnd =
      t && !isNaN(t.getTime())
        ? new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59)
        : end;
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR");
    return {
      range,
      start,
      end: customEnd,
      from: sp.from ?? "",
      to: sp.to ?? "",
      label: `${fmt(start)} a ${fmt(customEnd)}`,
    };
  }

  const days = range === "90" ? 90 : 30;
  const start = new Date(now.getTime() - (days - 1) * DAY_MS);
  start.setHours(0, 0, 0, 0);
  return { range, start, end, from: "", to: "", label: `Últimos ${days} dias` };
}

function accompaniedText(since: Date | null): string {
  if (!since) return "—";
  const months = Math.max(
    0,
    Math.floor((Date.now() - since.getTime()) / (30.44 * DAY_MS)),
  );
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const yLabel = `${years} ${years === 1 ? "ano" : "anos"}`;
  if (rem === 0) return yLabel;
  return `${yLabel} e ${rem} ${rem === 1 ? "mês" : "meses"}`;
}

export interface MetricRow {
  label: string;
  value: number;
  trend: number;
  color: string;
  lowerIsBetter: boolean;
}

export interface ChildReportData {
  child: {
    name: string;
    age: number;
    supportLevel: number | null;
    overallEvolution: number;
  };
  guardians: string;
  therapistName: string;
  accompanied: string;
  window: { label: string };
  generatedAt: string;
  metrics: MetricRow[];
  timeline: { label: string; value: number }[];
  records: {
    date: string;
    category: string;
    moodEmoji: string;
    performance: number;
    note: string | null;
  }[];
  achievements: { title: string; icon: string; earnedAt: string }[];
  sessionsCompleted: number;
  sessionsInRange: number;
  recentDomains: { label: string; score: number }[];
}

const moodEmoji = (v: number) =>
  MOOD_SCALE.find((m) => m.value === v)?.emoji ?? "";

/** Monta todos os dados do relatório individual (ou null se sem acesso). */
export async function getChildReportData(
  session: SessionPayload,
  childId: string,
  win: ReportWindow,
): Promise<ChildReportData | null> {
  if (!(await canAccessChild(session, childId))) return null;

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      therapist: { select: { name: true } },
      guardians: { select: { name: true } },
      metrics: true,
    },
  });
  if (!child) return null;

  const [records, achievements, sessionsCompleted, sessionsInRange, domains] =
    await Promise.all([
      prisma.evolutionRecord.findMany({
        where: { childId, date: { gte: win.start, lte: win.end } },
        orderBy: { date: "asc" },
      }),
      prisma.achievement.findMany({
        where: { childId },
        orderBy: { earnedAt: "desc" },
        take: 8,
      }),
      prisma.therapySession.count({
        where: { childId, status: "COMPLETED" },
      }),
      prisma.therapySession.count({
        where: {
          childId,
          status: "COMPLETED",
          scheduledAt: { gte: win.start, lte: win.end },
        },
      }),
      prisma.progressEntry.groupBy({
        by: ["domain"],
        where: { childId },
        _avg: { score: true },
      }),
    ]);

  const metricMap = new Map(child.metrics.map((m) => [m.key, m]));
  const metrics: MetricRow[] = METRIC_ORDER.map((key) => {
    const m = metricMap.get(key);
    const meta = METRIC_META[key];
    return {
      label: meta.label,
      value: m?.value ?? 0,
      trend: m?.trend ?? 0,
      color: meta.color,
      lowerIsBetter: !!meta.lowerIsBetter,
    };
  });

  const timeline = records.map((r) => ({
    label: r.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    value: Math.round(
      ((r.communication + r.social + r.sleep + r.performance + r.feeding) / 5) *
        20,
    ),
  }));

  const recordsResumed = [...records]
    .reverse()
    .slice(0, 10)
    .map((r) => ({
      date: r.date.toLocaleDateString("pt-BR"),
      category: EVOLUTION_CATEGORY_LABELS[r.category],
      moodEmoji: moodEmoji(r.mood),
      performance: r.performance,
      note: r.note,
    }));

  return {
    child: {
      name: child.name,
      age: calcAge(child.birthDate),
      supportLevel: child.supportLevel,
      overallEvolution: child.overallEvolution,
    },
    guardians: child.guardians.map((g) => g.name).join(", ") || "—",
    therapistName: child.therapist?.name ?? "—",
    accompanied: accompaniedText(child.accompaniedSince),
    window: { label: win.label },
    generatedAt: new Date().toLocaleString("pt-BR"),
    metrics,
    timeline,
    records: recordsResumed,
    achievements: achievements.map((a) => ({
      title: a.title,
      icon: a.icon ?? "★",
      earnedAt: a.earnedAt.toLocaleDateString("pt-BR"),
    })),
    sessionsCompleted,
    sessionsInRange,
    recentDomains: domains.map((d) => ({
      label: DOMAIN_LABELS[d.domain],
      score: Math.round((d._avg.score ?? 0) * 10) / 10,
    })),
  };
}
