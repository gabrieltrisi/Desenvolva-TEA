// Recalcula as métricas do painel (ChildMetric) a partir dos EvolutionRecords.
// Helper PURO: recebe o client Prisma por parâmetro para funcionar tanto no
// seed (tsx/node) quanto em Server Actions, sem importar "server-only".
import type { Prisma } from "@/generated/prisma/client";
import type { MetricKey } from "@/generated/prisma/enums";

// Aceita tanto o client base (seed) quanto o estendido com $extends (Server
// Actions) ou de transação. Tipamos só os métodos usados — sem acoplar às
// assinaturas exatas dos delegates, que diferem entre base e extensão.
type MetricsClient = {
  evolutionRecord: {
    findMany(args: Prisma.EvolutionRecordFindManyArgs): Promise<unknown[]>;
  };
  childMetric: {
    upsert(args: Prisma.ChildMetricUpsertArgs): Promise<unknown>;
  };
  child: {
    update(args: Prisma.ChildUpdateArgs): Promise<unknown>;
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;

type RecordRow = {
  date: Date;
  performance: number;
  mood: number;
  social: number;
  communication: number;
  sleep: number;
  feeding: number;
};

/** Cada métrica deriva de um campo 1–5 do registro (média × 20 = 0–100%). */
const METRIC_SOURCE: { key: MetricKey; pick: (r: RecordRow) => number }[] = [
  { key: "COMMUNICATION", pick: (r) => r.communication },
  { key: "SOCIAL_INTERACTION", pick: (r) => r.social },
  { key: "SLEEP_QUALITY", pick: (r) => r.sleep },
  { key: "COGNITIVE", pick: (r) => r.performance },
  { key: "DAILY_ROUTINE", pick: (r) => r.feeding },
  // Frequência de crises: quanto pior o humor, maior. (5 - humor) em escala 1–5.
  { key: "CRISIS_FREQUENCY", pick: (r) => 5 - r.mood },
];

/** Métricas em que "para cima" é positivo (todas menos crises). */
const POSITIVE_FOR_OVERALL: MetricKey[] = [
  "COMMUNICATION",
  "SOCIAL_INTERACTION",
  "SLEEP_QUALITY",
  "COGNITIVE",
  "DAILY_ROUTINE",
];

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function toPct(scale1to5: number): number {
  return Math.round(scale1to5 * 20);
}

/**
 * Recalcula e persiste as 6 métricas + a evolução geral da criança.
 * Janela atual = últimos 30 dias; tendência = atual vs. 30–60 dias anteriores.
 */
export async function recomputeChildMetrics(
  prisma: MetricsClient,
  childId: string,
): Promise<void> {
  const now = Date.now();
  const curStart = new Date(now - 30 * DAY_MS);
  const prevStart = new Date(now - 60 * DAY_MS);

  const rows = (await prisma.evolutionRecord.findMany({
    where: { childId, date: { gte: prevStart } },
    select: {
      date: true,
      performance: true,
      mood: true,
      social: true,
      communication: true,
      sleep: true,
      feeding: true,
    },
  })) as RecordRow[];

  const current = rows.filter((r) => r.date >= curStart);
  const previous = rows.filter((r) => r.date < curStart);

  if (current.length === 0) return; // sem dados recentes, mantém as métricas atuais

  const overallValues: number[] = [];

  for (const { key, pick } of METRIC_SOURCE) {
    const curAvg = avg(current.map(pick));
    if (curAvg == null) continue;
    const value = toPct(curAvg);

    const prevAvg = avg(previous.map(pick));
    const trend = prevAvg == null ? 0 : value - toPct(prevAvg);

    if (POSITIVE_FOR_OVERALL.includes(key)) overallValues.push(value);

    await prisma.childMetric.upsert({
      where: { childId_key: { childId, key } },
      update: { value, trend },
      create: { childId, key, value, trend },
    });
  }

  const overall = avg(overallValues);
  if (overall != null) {
    await prisma.child.update({
      where: { id: childId },
      data: { overallEvolution: Math.round(overall) },
    });
  }
}
