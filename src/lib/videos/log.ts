import "server-only";

/**
 * Log estruturado e seguro do pipeline de vídeos.
 *
 * ⚠️ LGPD/segurança: estes logs NUNCA devem conter URLs assinadas (presigned),
 * segredos S3, nomes/e-mails ou qualquer dado pessoal, nem stack traces crus.
 * Apenas identificadores opacos (cuid de organização/conteúdo), categoria do
 * evento e metadados técnicos (tamanho, status, especialidade).
 */
type VideoEvent =
  | "upload_url_issued"
  | "upload_finalized"
  | "playback_url_issued"
  | "storage_error";

interface VideoLogFields {
  event: VideoEvent;
  organizationId?: string;
  contentId?: string;
  specialty?: string;
  sizeBytes?: number;
  published?: boolean;
  /** Categoria curta do erro (ex.: "presign_failed"). Nunca a mensagem crua. */
  detail?: string;
}

function emit(level: "info" | "error", fields: VideoLogFields): void {
  // Serialização achatada para facilitar coleta por agregadores de log.
  const line = JSON.stringify({ scope: "videos", level, ...fields });
  if (level === "error") console.error(line);
  else console.log(line);
}

export function logVideoEvent(fields: VideoLogFields): void {
  emit("info", fields);
}

export function logVideoError(fields: VideoLogFields): void {
  emit("error", fields);
}
