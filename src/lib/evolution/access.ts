import "server-only";
import type { SessionPayload } from "@/lib/auth/session";
import {
  canAccessChild as canAccessChildByUser,
  getAccessibleChildren as getAccessibleChildrenByUser,
  resolveAccessUser,
} from "@/lib/access/children";

/**
 * Compatibilidade: estes wrappers preservam a assinatura baseada em
 * `SessionPayload` usada pelas telas/ações atuais, mas DELEGAM toda a regra
 * para `@/lib/access/children` (fonte única). Não há regra de acesso duplicada
 * aqui.
 */

/** Crianças que o usuário pode acompanhar (regra centralizada por papel). */
export async function getAccessibleChildren(session: SessionPayload) {
  const user = await resolveAccessUser(session);
  return getAccessibleChildrenByUser(user);
}

/** Verifica se o usuário pode acessar/registrar para uma criança específica. */
export async function canAccessChild(
  session: SessionPayload,
  childId: string,
): Promise<boolean> {
  const user = await resolveAccessUser(session);
  return canAccessChildByUser(user, childId);
}
