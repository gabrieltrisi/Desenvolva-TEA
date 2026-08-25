import { getSession } from "@/lib/auth/session";
import { canManageVideos } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import {
  isCloudinaryConfigured,
  verifyCloudinaryResource,
  VIDEO_RESOURCE_TYPE,
} from "@/lib/storage/cloudinary";
import {
  MAX_VIDEO_BYTES,
  humanMaxSize,
  isAllowedVideoMime,
} from "@/lib/videos/validation";
import { logVideoEvent, logVideoError } from "@/lib/videos/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Passo 2 do upload: após o envio direto ao Cloudinary, o ADMIN finaliza. O
 * servidor confirma o recurso via Admin API (usando o public_id que ele mesmo
 * reservou — não confia em valores do client), valida tipo/formato/tamanho e
 * grava os metadados reais (secure_url, bytes, format) publicando o conteúdo.
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

  const { contentId, publish } = (body ?? {}) as Record<string, unknown>;
  const id = String(contentId ?? "");
  if (!id) return Response.json({ error: "contentId ausente." }, { status: 400 });

  const content = await prisma.content.findUnique({ where: { id } });
  if (
    !content ||
    content.organizationId !== session.organizationId ||
    content.type !== "VIDEO" ||
    !content.storageKey
  )
    return Response.json({ error: "Vídeo não encontrado." }, { status: 404 });

  // Confirma o recurso no Cloudinary pelo public_id reservado no sign-upload.
  let resource;
  try {
    resource = await verifyCloudinaryResource(content.storageKey);
  } catch {
    logVideoError({
      event: "storage_error",
      organizationId: session.organizationId,
      contentId: id,
      detail: "cloudinary_resource_not_found",
    });
    return Response.json(
      { error: "Upload não encontrado no Cloudinary. Reenvie o arquivo." },
      { status: 409 },
    );
  }

  // Validações sobre os metadados REAIS.
  if (resource.resourceType !== VIDEO_RESOURCE_TYPE)
    return Response.json({ error: "Recurso não é um vídeo." }, { status: 400 });
  const mime = `video/${resource.format}`;
  if (!isAllowedVideoMime(mime))
    return Response.json(
      { error: "Formato não suportado. Envie um arquivo .mp4." },
      { status: 400 },
    );
  if (resource.bytes > MAX_VIDEO_BYTES)
    return Response.json(
      { error: `Arquivo excede o limite de ${humanMaxSize()}.` },
      { status: 400 },
    );

  const updated = await prisma.content.update({
    where: { id },
    data: {
      url: resource.secureUrl,
      mimeType: mime,
      sizeBytes: resource.bytes,
      published: publish !== false,
    },
  });

  logVideoEvent({
    event: "upload_finalized",
    organizationId: session.organizationId,
    contentId: id,
    specialty: content.specialty ?? undefined,
    sizeBytes: resource.bytes,
    published: updated.published,
  });

  return Response.json({ ok: true, published: updated.published });
}
