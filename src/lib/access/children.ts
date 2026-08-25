import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import type { SessionPayload } from "@/lib/auth/session";

/**
 * Fonte ÚNICA das regras de acesso a crianças/pacientes (Fase 2).
 *
 * Regras por papel:
 *  - ADMIN        → todas as crianças da mesma organização.
 *  - PREFEITURA   → exige municipalityId; só crianças com ChildMunicipalityLink
 *                   APPROVED para esse município. Sem municipalityId ⇒ NADA.
 *  - FAMILIA      → só crianças com ChildGuardianLink ACTIVE (guardianUserId = user).
 *  - PROFISSIONAL → só crianças com therapistId = user.
 *
 * SEGURANÇA: nenhum papel exceto ADMIN usa organizationId como fallback. O
 * organizationId aqui é sempre um cerco ADICIONAL (defesa em profundidade),
 * nunca a única condição para os demais papéis.
 */

/** Usuário "resolvido" para decisões de acesso (independente do shape do JWT). */
export interface AccessUser {
  userId: string;
  role: Role;
  organizationId: string;
  /** Necessário só para PREFEITURA; null para os demais papéis. */
  municipalityId: string | null;
}

/** Where que NÃO casa com nenhuma linha (cerco impossível, seguro por padrão). */
const MATCH_NONE: Prisma.ChildWhereInput = { id: { in: [] } };

export function isAdmin(user: AccessUser): boolean {
  return user.role === "ADMIN";
}
export function isMunicipalityUser(user: AccessUser): boolean {
  return user.role === "PREFEITURA";
}
export function isFamilyUser(user: AccessUser): boolean {
  return user.role === "FAMILIA";
}
export function isProfessionalUser(user: AccessUser): boolean {
  return user.role === "PROFISSIONAL";
}

/**
 * Constrói o `where` de crianças acessíveis. Puro/síncrono — combinável com
 * `prisma.child.findMany`, `count` e `groupBy`.
 */
export function getAccessibleChildrenWhere(user: AccessUser): Prisma.ChildWhereInput {
  switch (user.role) {
    case "ADMIN":
      return { organizationId: user.organizationId };

    case "PREFEITURA":
      // Sem município vinculado ⇒ nunca cai para a organização inteira.
      if (!user.municipalityId) return MATCH_NONE;
      return {
        organizationId: user.organizationId,
        municipalityLinks: {
          some: { municipalityId: user.municipalityId, status: "APPROVED" },
        },
      };

    case "FAMILIA":
      return {
        organizationId: user.organizationId,
        guardianLinks: {
          some: { guardianUserId: user.userId, status: "ACTIVE" },
        },
      };

    case "PROFISSIONAL":
      return { organizationId: user.organizationId, therapistId: user.userId };

    default:
      // Papel desconhecido: nega tudo.
      return MATCH_NONE;
  }
}

/** Opções suportadas ao listar crianças acessíveis (sem afrouxar o `where`). */
export interface AccessibleChildrenOptions {
  orderBy?:
    | Prisma.ChildOrderByWithRelationInput
    | Prisma.ChildOrderByWithRelationInput[];
}

/**
 * Lista as crianças acessíveis ao usuário. Ordenação padrão por criação
 * (estável por id) — preserva o comportamento histórico do painel.
 */
export function getAccessibleChildren(
  user: AccessUser,
  options?: AccessibleChildrenOptions,
) {
  return prisma.child.findMany({
    where: getAccessibleChildrenWhere(user),
    orderBy: options?.orderBy ?? [{ createdAt: "asc" }, { id: "asc" }],
  });
}

/** Verifica se o usuário pode acessar/registrar para uma criança específica. */
export async function canAccessChild(
  user: AccessUser,
  childId: string,
): Promise<boolean> {
  const child = await prisma.child.findFirst({
    where: { AND: [{ id: childId }, getAccessibleChildrenWhere(user)] },
    select: { id: true },
  });
  return child != null;
}

/** Abrangência de município do usuário — base para relatórios municipais (Fase 3). */
export type MunicipalityScope =
  | { kind: "all"; organizationId: string }
  | { kind: "single"; organizationId: string; municipalityId: string }
  | { kind: "none" };

export function getMunicipalityScope(user: AccessUser): MunicipalityScope {
  if (user.role === "ADMIN") {
    return { kind: "all", organizationId: user.organizationId };
  }
  if (user.role === "PREFEITURA" && user.municipalityId) {
    return {
      kind: "single",
      organizationId: user.organizationId,
      municipalityId: user.municipalityId,
    };
  }
  return { kind: "none" };
}

/**
 * Converte a sessão (JWT) em AccessUser. Para PREFEITURA, resolve o
 * municipalityId: usa o valor já presente no token se houver (forward-compat),
 * senão consulta o banco. Demais papéis não precisam de município.
 */
export async function resolveAccessUser(
  session: SessionPayload,
): Promise<AccessUser> {
  let municipalityId: string | null = null;

  if (session.role === "PREFEITURA") {
    const fromToken = session.municipalityId;
    if (typeof fromToken === "string" && fromToken.length > 0) {
      municipalityId = fromToken;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { municipalityId: true },
      });
      municipalityId = user?.municipalityId ?? null;
    }
  }

  return {
    userId: session.userId,
    role: session.role,
    organizationId: session.organizationId,
    municipalityId,
  };
}
