import type { Metadata } from "next";
import { BookOpen, FileText, Video, Puzzle, BookMarked } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ContentType } from "@/generated/prisma/enums";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "Conteúdos" };

const TYPE_ICON: Record<ContentType, LucideIcon> = {
  ARTICLE: FileText,
  VIDEO: Video,
  ACTIVITY: Puzzle,
  GUIDE: BookMarked,
};

export default async function ConteudosPage() {
  const session = await getSession();
  if (!session) return null;

  const contents = await prisma.content.findMany({
    where: { organizationId: session.organizationId, published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Biblioteca de conteúdos"
        description="Materiais terapêuticos e educativos para apoiar o dia a dia."
      />

      {contents.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Biblioteca vazia"
          description="Os conteúdos terapêuticos aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => {
            const Icon = TYPE_ICON[content.type];
            return (
              <Card key={content.id} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-trust-50 text-trust-500">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone="trust">{CONTENT_TYPE_LABELS[content.type]}</Badge>
                </div>
                <CardTitle className="text-base">{content.title}</CardTitle>
                <CardDescription className="mt-1 line-clamp-3 flex-1">
                  {content.summary}
                </CardDescription>
                {content.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
