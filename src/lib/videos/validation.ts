/**
 * Regras de validação dos vídeos terapêuticos (compartilhadas entre os endpoints
 * de upload e a tela de admin). Mantidas em um único lugar para que limites e
 * tipos aceitos não divirjam entre cliente e servidor.
 */
import { ContentSpecialty } from "@/generated/prisma/enums";

/** Tamanho máximo aceito por upload (500 MB). */
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

/** Tipos MIME aceitos. Por ora apenas MP4 (ver docs/VIDEO_PIPELINE.md). */
export const ALLOWED_VIDEO_MIME = ["video/mp4"] as const;
export type AllowedVideoMime = (typeof ALLOWED_VIDEO_MIME)[number];

export function isAllowedVideoMime(mime: string): mime is AllowedVideoMime {
  return (ALLOWED_VIDEO_MIME as readonly string[]).includes(mime);
}

export function isValidSpecialty(value: string): value is ContentSpecialty {
  return Object.values(ContentSpecialty).includes(value as ContentSpecialty);
}

/** `500 MB` legível, para mensagens de erro. */
export function humanMaxSize(): string {
  return `${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB`;
}
