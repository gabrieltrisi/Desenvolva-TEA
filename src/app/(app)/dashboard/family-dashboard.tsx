import { Baby } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";
import { calcAge, currentDate, daysAgo, yearsSince } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { HeroCard } from "@/components/dashboard/hero-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  EvolutionChart,
  type EvolutionData,
} from "@/components/dashboard/evolution-chart";
import { METRIC_ORDER } from "@/components/dashboard/metric-meta";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function sessionLabel(date: Date): string {
  const day = WEEKDAYS[date.getDay()];
  return `${day} ${date.getHours()}h`;
}

export async function FamilyDashboard({ session }: { session: SessionPayload }) {
  const child = await prisma.child.findFirst({
    where: {
      organizationId: session.organizationId,
      guardians: { some: { id: session.userId } },
    },
    orderBy: { createdAt: "asc" },
    include: {
      therapist: { select: { name: true } },
      metrics: true,
    },
  });

  if (!child) {
    return (
      <EmptyState
        icon={Baby}
        title="Nenhuma criança vinculada"
        description="Cadastre uma criança para visualizar o painel de acompanhamento."
        action={
          <Button asChild>
            <Link href="/criancas/nova">Cadastrar criança</Link>
          </Button>
        }
      />
    );
  }

  const weekAgo = daysAgo(7);
  const [completedSessions, achievementsCount, xpAgg, nextSession, evoPoints] =
    await Promise.all([
      prisma.therapySession.count({
        where: { childId: child.id, status: "COMPLETED" },
      }),
      prisma.achievement.count({ where: { childId: child.id } }),
      prisma.xpEvent.aggregate({
        where: { childId: child.id, createdAt: { gte: weekAgo } },
        _sum: { amount: true },
      }),
      prisma.therapySession.findFirst({
        where: {
          childId: child.id,
          status: "SCHEDULED",
          scheduledAt: { gte: currentDate() },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.evolutionPoint.findMany({
        where: { childId: child.id },
        orderBy: { order: "asc" },
      }),
    ]);

  const accompaniedYears = child.accompaniedSince
    ? yearsSince(child.accompaniedSince)
    : null;

  const chartData: EvolutionData = { WEEK: [], MONTH: [], YEAR: [] };
  for (const p of evoPoints) {
    chartData[p.period].push({ label: p.label, value: p.value });
  }

  const metricMap = new Map(child.metrics.map((m) => [m.key, m]));

  return (
    <div className="space-y-6">
      <HeroCard
        name={child.name}
        age={calcAge(child.birthDate)}
        supportLevel={child.supportLevel}
        accompaniedYears={accompaniedYears}
        therapistName={child.therapist?.name ?? null}
        planActive={child.planActive}
        nextSessionLabel={nextSession ? sessionLabel(nextSession.scheduledAt) : null}
        weeklyXp={xpAgg._sum.amount ?? 0}
        overallEvolution={child.overallEvolution}
        sessionsCount={completedSessions}
        achievementsCount={achievementsCount}
      />

      <EvolutionChart data={chartData} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRIC_ORDER.map((key) => {
          const m = metricMap.get(key);
          if (!m) return null;
          return (
            <MetricCard
              key={key}
              metricKey={key}
              value={m.value}
              trend={m.trend}
            />
          );
        })}
      </div>

      <QuickActions childId={child.id} />
    </div>
  );
}
