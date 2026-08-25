// Módulo edge-safe: apenas assinatura/verificação de JWT com jose.
// Pode ser importado tanto pelo middleware (Edge) quanto pelo servidor (Node).
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma/enums";

export const SESSION_COOKIE = "tea_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  [key: string]: unknown;
}

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET ausente ou muito curto. Verifique seu .env.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Verifica e decodifica um token. Retorna null se inválido/expirado. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}
