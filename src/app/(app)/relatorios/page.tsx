import type { Metadata } from "next";
import Link from "next/link";
import { FileBarChart, FileText } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getAccessibleChildren } from "@/lib/evolution/access";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { calcAge } from "@/lib/utils";
import { DOMAIN_LABELS, ENROLLMENT_STATUS_LABELS } from "@/lib/labels";
import type {
  DevelopmentDomain,
  EnrollmentStatus,
} from "@/generated/prisma/enums";

export const metadata: Metadata = { title: "Relatórios" };

export default async function RelatoriosPage() {
  const session = await getSession();
  if (!session) return null;
  const organizationId = session.organizationId;

  const [byDomain, byStatus, totalEntries] = await Promise.all([
    prisma.progressEntry.groupBy({
      by: ["domain"],
      where: { child: { organizationId } },
      _avg: { score: true },
      _count: { _all: true },
    }),
    prisma.trackEnrollment.groupBy({
      by: ["status"],
      where: { child: { organizationId } },
      _count: { _all: true },
    }),
    prisma.progressEntry.count({ where: { child: { organizationId } } }),
  ]);

  const statusMap = new Map(byStatus.map((s) => [s.status, s._count._all]));
  const children = await getAccessibleChildren(session);

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Visão consolidada da evolução e do engajamento nas trilhas."
      />

      {/* Relatórios individuais em PDF */}
      <Card className="mb-6">
        <CardTitle className="mb-1 flex items-center gap-2">
          <FileText className="h-4 w-4 text-brand-500" /> Relatórios individuais
        </CardTitle>
        <p className="mb-4 text-sm text-slate-500">
          Gere um relatório profissional em PDF por criança.
        </p>
        {children.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma criança disponível.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/relatorios/crianca/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-surface-muted"
              >
                <Avatar name={c.name} color={c.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {calcAge(c.birthDate)} anos
                  </p>
                </div>
                <FileBarChart className="h-4 w-4 text-brand-500" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {totalEntries === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="Sem dados para relatório"
          description="Os relatórios serão gerados conforme registros forem lançados."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle className="mb-4">Média por domínio</CardTitle>
            <ul className="space-y-3">
              {byDomain.map((row) => {
                const avg = Math.round((row._avg.score ?? 0) * 10) / 10;
                const pct = Math.min(100, (avg / 10) * 100);
                return (
                  <li key={row.domain}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-foreground">
                        {DOMAIN_LABELS[row.domain as DevelopmentDomain]}
                      </span>
                      <span className="text-slate-500">{avg}/10</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardTitle className="mb-4">Trilhas por status</CardTitle>
            <ul className="space-y-3">
              {(
                ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as EnrollmentStatus[]
              ).map((status) => (
                <li
                  key={status}
                  className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {ENROLLMENT_STATUS_LABELS[status]}
                  </span>
                  <span className="text-lg font-extrabold text-brand-600">
                    {statusMap.get(status) ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
