import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Video, UploadCloud } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { canManageVideos } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CONTENT_SPECIALTY_LABELS } from "@/lib/labels";
import { VideoPlayer } from "@/components/video/video-player";

export const metadata: Metadata = { title: "Vídeos" };

export default async function AdminVideosPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManageVideos(session.role)) redirect("/dashboard");

  const videos = await prisma.content.findMany({
    where: {
      organizationId: session.organizationId,
      type: "VIDEO",
      storageKey: { not: null },
    },
    // Agrupa por especialidade e mantém a sequência numérica do título (01..10).
    orderBy: [{ specialty: "asc" }, { title: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Vídeos terapêuticos"
        description="Envie e gerencie os vídeos por especialidade."
        action={
          <Button asChild>
            <Link href="/admin/videos/novo">
              <UploadCloud className="h-4 w-4" />
              Enviar vídeo
            </Link>
          </Button>
        }
      />

      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="Nenhum vídeo enviado"
          description="Os vídeos enviados aparecerão aqui, organizados por especialidade."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <Card key={v.id} className="flex flex-col">
              <VideoPlayer contentId={v.id} />
              <div className="mt-3 flex items-center justify-between gap-2">
                {v.specialty && (
                  <Badge tone="trust">
                    {CONTENT_SPECIALTY_LABELS[v.specialty]}
                  </Badge>
                )}
                <Badge tone={v.published ? "success" : "neutral"}>
                  {v.published ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <CardTitle className="mt-2 text-base">{v.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2 flex-1">
                {v.summary}
              </CardDescription>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
