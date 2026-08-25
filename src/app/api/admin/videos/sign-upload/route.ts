import { getSession } from "@/lib/auth/session";
import { canManageVideos } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import {
  isCloudinaryConfigured,
  signCloudinaryUpload,
  expectedPublicId,
} from "@/lib/storage/cloudinary";
import { isValidSpecialty } from "@/lib/videos/validation";
import { logVideoEvent, logVideoError } from "@/lib/videos/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Passo 1 do upload (Cloudinary signed upload): o ADMIN informa os metadados;
 * o servidor cria um Content rascunho (published=false), reserva o public_id
 * (folder/contentId) e devolve a assinatura para o browser enviar o .mp4 direto
 * ao Cloudinary. O API_SECRET nunca sai do servidor.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 });
  if (!canManageVideos(session.role))
    return Response.json({ error: "Acesso negado" }, { status: 403 });

  if (!isCloudinaryConfigured())
    return Response.json(
      { error: "Armazenamento de vídeos (Cloudinary) não configurado." },
      { status: 503 },
    );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { title, summary, specialty } = (body ?? {}) as Record<string, unknown>;
  const titleStr = String(title ?? "").trim();
  const summaryStr = String(summary ?? "").trim();
  const specialtyStr = String(specialty ?? "");

  if (!titleStr || !summaryStr)
    return Response.json({ error: "Informe título e descrição." }, { status: 400 });
  if (!isValidSpecialty(specialtyStr))
    return Response.json({ error: "Especialidade inválida." }, { status: 400 });

  // Rascunho para obter o id; o public_id deriva dele.
  const content = await prisma.content.create({
    data: {
      title: titleStr,
      summary: summaryStr,
      type: "VIDEO",
      specialty: specialtyStr,
      published: false,
      organizationId: session.organizationId,
    },
  });

  try {
    const storageKey = expectedPublicId(content.id); // folder/contentId
    await prisma.content.update({
      where: { id: content.id },
      data: { storageKey },
    });

    const sig = signCloudinaryUpload({ contentId: content.id });

    logVideoEvent({
      event: "upload_url_issued",
      organizationId: session.organizationId,
      contentId: content.id,
      specialty: specialtyStr,
      detail: "cloudinary_signed",
    });

    return Response.json({ contentId: content.id, ...sig });
  } catch {
    await prisma.content.delete({ where: { id: content.id } }).catch(() => {});
    logVideoError({
      event: "storage_error",
      organizationId: session.organizationId,
      contentId: content.id,
      detail: "cloudinary_sign_failed",
    });
    return Response.json(
      { error: "Falha ao preparar o upload. Tente novamente." },
      { status: 502 },
    );
  }
}
