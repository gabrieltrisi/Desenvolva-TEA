import { getSession } from "@/lib/auth/session";
import { canManageVideos } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { logVideoEvent } from "@/lib/videos/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * URL de reprodução do vídeo (Cloudinary). Exige sessão, mesma organização e
 * `published=true` (ADMIN pré-visualiza rascunho).
 *
 * Demo: devolve o `secure_url` salvo no Content (entrega pública via CDN do
 * Cloudinary). Em produção privada, trocar por URL assinada/autenticada
 * (ver getCloudinaryPlaybackUrl em src/lib/storage/cloudinary.ts).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const content = await prisma.content.findUnique({ where: { id } });

  if (
    !content ||
    content.organizationId !== session.organizationId ||
    content.type !== "VIDEO" ||
    !content.url
  )
    return Response.json({ error: "Vídeo não encontrado." }, { status: 404 });

  if (!content.published && !canManageVideos(session.role))
    return Response.json({ error: "Vídeo indisponível." }, { status: 403 });

  logVideoEvent({
    event: "playback_url_issued",
    organizationId: session.organizationId,
    contentId: content.id,
    specialty: content.specialty ?? undefined,
  });

  return Response.json(
    { url: content.url },
    { headers: { "Cache-Control": "no-store" } },
  );
}
