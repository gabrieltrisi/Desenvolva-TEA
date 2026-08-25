import Link from "next/link";
import { Baby, Route, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";
import {
  getAccessibleChildrenWhere,
  resolveAccessUser,
} from "@/lib/access/children";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { calcAge } from "@/lib/utils";

export async function GenericDashboard({
  session,
}: {
  session: SessionPayload;
}) {
  const organizationId = session.organizationId;
  const user = await resolveAccessUser(session);
  const childWhere = getAccessibleChildrenWhere(user);

  // Crianças e métricas derivadas de crianças respeitam o escopo do perfil;
  // trilhas e conteúdos são catálogo da organização (não-sensível por criança).
  const [childrenCount, tracksCount, contentsCount, progressAgg, recentChildren] =
    await Promise.all([
      prisma.child.count({ where: childWhere }),
      prisma.learningTrack.count({ where: { organizationId } }),
      prisma.content.count({ where: { organizationId, published: true } }),
      prisma.trackEnrollment.aggregate({
        where: { child: childWhere },
        _avg: { progress: true },
      }),
      prisma.child.findMany({
        where: childWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { enrollments: true } } },
      }),
    ]);

  const avgProgress = Math.round(progressAgg._avg.progress ?? 0);

  return (
    <>
      <PageHeader
        title={`Olá, ${session.name.split(" ")[0]}! 👋`}
        description={`Visão geral · perfil ${ROLE_LABELS[session.role]}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Baby} label="Crianças" value={childrenCount} />
        <StatCard icon={Route} label="Trilhas" value={tracksCount} />
        <StatCard icon={BookOpen} label="Conteúdos" value={contentsCount} />
        <StatCard
          icon={TrendingUp}
          label="Progresso médio"
          value={`${avgProgress}%`}
        />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Crianças recentes</CardTitle>
          <Link
            href="/criancas"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentChildren.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhuma criança cadastrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentChildren.map((child) => (
              <li
                key={child.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <Avatar name={child.name} color={child.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {child.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {calcAge(child.birthDate)} anos
                  </p>
                </div>
                <Badge tone="trust">{child._count.enrollments} trilhas</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
