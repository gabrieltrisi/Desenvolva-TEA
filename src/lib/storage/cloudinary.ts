import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { validateEnv } from "@/lib/env";

/**
 * Integração com Cloudinary para os vídeos terapêuticos (solução de demo).
 *
 * ⚠️ SERVER-ONLY: lê CLOUDINARY_API_SECRET. NUNCA importar de Client Component.
 * O upload é "signed direct": o servidor gera a assinatura; o browser envia o
 * arquivo direto ao Cloudinary (contorna o limite de body do serverless da Vercel).
 */

export const VIDEO_RESOURCE_TYPE = "video";

/** Retorna true só se todas as variáveis essenciais estiverem presentes. */
export function isCloudinaryConfigured(): boolean {
  const env = validateEnv();
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
  );
}

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super(
      "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.",
    );
    this.name = "CloudinaryNotConfiguredError";
  }
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

function getConfig(): CloudinaryConfig {
  const env = validateEnv();
  if (!isCloudinaryConfigured()) throw new CloudinaryNotConfiguredError();
  const cfg: CloudinaryConfig = {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    apiSecret: env.CLOUDINARY_API_SECRET!,
    folder: env.CLOUDINARY_FOLDER?.trim() || "desenvolva-tea/videos",
  };
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });
  return cfg;
}

/** A pasta configurada (para validar o public_id no finalize). */
export function cloudinaryFolder(): string {
  return getConfig().folder;
}

/** public_id canônico esperado para um conteúdo (folder/contentId). */
export function expectedPublicId(contentId: string): string {
  return `${getConfig().folder}/${contentId}`;
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string; // public_id "curto" (o contentId); o Cloudinary prefixa o folder
  uploadUrl: string; // endpoint de upload de vídeo do Cloudinary
}

/**
 * Gera a assinatura para o upload direto do browser (signed upload).
 * Assina exatamente os params que o browser enviará: folder, public_id, timestamp.
 */
export function signCloudinaryUpload(params: {
  contentId: string;
}): UploadSignature {
  const { cloudName, apiKey, apiSecret, folder } = getConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = params.contentId;
  const signature = cloudinary.utils.api_sign_request(
    { folder, public_id: publicId, timestamp },
    apiSecret,
  );
  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
  };
}

export interface CloudinaryResource {
  publicId: string;
  bytes: number;
  format: string;
  secureUrl: string;
  resourceType: string;
}

/**
 * Confirma, via Admin API, que o recurso existe e é vídeo — e devolve os
 * metadados REAIS (não confia nos valores informados pelo client).
 */
export async function verifyCloudinaryResource(
  publicId: string,
): Promise<CloudinaryResource> {
  getConfig();
  const res = await cloudinary.api.resource(publicId, {
    resource_type: VIDEO_RESOURCE_TYPE,
  });
  return {
    publicId: res.public_id,
    bytes: res.bytes,
    format: res.format,
    secureUrl: res.secure_url,
    resourceType: res.resource_type,
  };
}

/**
 * URL de reprodução. Para a demo, usamos a entrega pública (secure). Para tornar
 * privado no futuro, trocar por `type: "authenticated"` + `sign_url: true`.
 */
export function getCloudinaryPlaybackUrl(publicId: string): string {
  getConfig();
  return cloudinary.url(publicId, {
    resource_type: VIDEO_RESOURCE_TYPE,
    secure: true,
  });
}
