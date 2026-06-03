import type { Metadata } from "next";
import { Route } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DOMAIN_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "Trilhas" };

export default async function TrilhasPage() {
  const session = await getSession();
  if (!session) return null;

  const tracks = await prisma.learningTrack.findMany({
    where: { organizationId: session.organizationId, published: true },
    orderBy: { order: "asc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  return (
    <>
      <PageHeader
        title="Trilhas de aprendizagem"
        description="Sequências de atividades organizadas por área do desenvolvimento."
      />

      {tracks.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Nenhuma trilha disponível"
          description="As trilhas aparecerão aqui assim que forem publicadas."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Card key={track.id} className="flex flex-col">
              <span
                className="mb-4 h-2 w-full rounded-full"
                style={{ backgroundColor: track.coverColor }}
              />
              <Badge tone="brand" className="mb-2 w-fit">
                {DOMAIN_LABELS[track.domain]}
              </Badge>
              <CardTitle>{track.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-3 flex-1">
                {track.description}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>{track._count.modules} módulos</span>
                <span>{track._count.enrollments} matrículas</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
