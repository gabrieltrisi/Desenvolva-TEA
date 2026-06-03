import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";

/** Crianças que o usuário pode acompanhar (família = suas; demais = da organização). */
export function getAccessibleChildren(session: SessionPayload) {
  const base = { organizationId: session.organizationId };
  const where =
    session.role === "FAMILIA"
      ? { ...base, guardians: { some: { id: session.userId } } }
      : base;
  // Ordena por criação para que o padrão coincida com a criança principal do painel.
  // Desempate por id mantém a ordem estável quando há createdAt idênticos.
  return prisma.child.findMany({
    where,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

/** Verifica se o usuário pode acessar/registrar para uma criança específica. */
export async function canAccessChild(
  session: SessionPayload,
  childId: string,
): Promise<boolean> {
  const base = { id: childId, organizationId: session.organizationId };
  const where =
    session.role === "FAMILIA"
      ? { ...base, guardians: { some: { id: session.userId } } }
      : base;
  const child = await prisma.child.findFirst({ where, select: { id: true } });
  return child != null;
}
