"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { GuardianRelationship } from "@/generated/prisma/enums";

export interface AdminActionState {
  error?: string;
  ok?: boolean;
}

/**
 * Guarda central: toda action administrativa exige ADMIN no servidor (nunca
 * depende só da UI). Retorna a sessão ou null (o chamador decide o erro).
 */
async function getAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// ---------------------------------------------------------------------------
// Prefeituras / Municípios
// ---------------------------------------------------------------------------

export async function createMunicipalityAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Acesso restrito a administradores." };

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim().toUpperCase();
  const cnpjRaw = String(formData.get("cnpj") ?? "").trim();
  const active = formData.get("active") != null;

  if (!name || !city || !state) {
    return { error: "Informe nome, cidade e estado." };
  }
  if (state.length !== 2) {
    return { error: "Estado deve ter a sigla com 2 letras (ex.: BA)." };
  }

  await prisma.municipality.create({
    data: {
      name,
      city,
      state,
      cnpj: cnpjRaw || null,
      active,
      organizationId: session.organizationId,
    },
  });

  revalidatePath("/admin/prefeituras");
  return { ok: true };
}

/** Ativa/desativa um município (sem exclusão física). */
export async function setMunicipalityActiveAction(
  formData: FormData,
): Promise<void> {
  const session = await getAdminSession();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;

  // organizationId no where garante isolamento entre organizações.
  await prisma.municipality.updateMany({
    where: { id, organizationId: session.organizationId },
    data: { active },
  });

  revalidatePath("/admin/prefeituras");
}

// ---------------------------------------------------------------------------
// Vínculos criança ↔ município (aprovação)
// ---------------------------------------------------------------------------

export async function approveChildLinkAction(
  formData: FormData,
): Promise<void> {
  const session = await getAdminSession();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Só aprova vínculos PENDING cuja criança pertence à organização do admin.
  await prisma.childMunicipalityLink.updateMany({
    where: {
      id,
      status: "PENDING",
      child: { organizationId: session.organizationId },
    },
    data: {
      status: "APPROVED",
      approvedByUserId: session.userId,
      approvedAt: new Date(),
    },
  });

  revalidatePath("/admin/vinculos");
}

export async function rejectChildLinkAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Acesso restrito a administradores." };

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return { error: "Vínculo inválido." };
  if (!reason) return { error: "Informe o motivo da rejeição." };

  const result = await prisma.childMunicipalityLink.updateMany({
    where: {
      id,
      status: "PENDING",
      child: { organizationId: session.organizationId },
    },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });

  if (result.count === 0) {
    return { error: "Vínculo não encontrado ou já processado." };
  }

  revalidatePath("/admin/vinculos");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Vínculos criança ↔ responsável (família)
// ---------------------------------------------------------------------------

const RELATIONSHIPS = new Set<string>(Object.values(GuardianRelationship));

export async function linkGuardianAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Acesso restrito a administradores." };

  const childId = String(formData.get("childId") ?? "");
  const guardianUserId = String(formData.get("guardianUserId") ?? "");
  const relationshipRaw = String(formData.get("relationship") ?? "GUARDIAN");
  const setAsMain = formData.get("mainResponsible") != null;
  const relationship = (RELATIONSHIPS.has(relationshipRaw)
    ? relationshipRaw
    : "GUARDIAN") as GuardianRelationship;

  if (!childId || !guardianUserId) {
    return { error: "Selecione o paciente e o responsável." };
  }

  // Isolamento: criança e responsável precisam ser da organização do admin,
  // e o responsável precisa ter perfil FAMÍLIA.
  const [child, guardian] = await Promise.all([
    prisma.child.findFirst({
      where: { id: childId, organizationId: session.organizationId },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: {
        id: guardianUserId,
        organizationId: session.organizationId,
        role: "FAMILIA",
      },
      select: { id: true },
    }),
  ]);
  if (!child) return { error: "Paciente não encontrado nesta organização." };
  if (!guardian) {
    return { error: "Usuário responsável inválido (precisa ser perfil Família)." };
  }

  // Upsert pelo par único (childId, guardianUserId): reativa se já existia.
  await prisma.childGuardianLink.upsert({
    where: { childId_guardianUserId: { childId, guardianUserId } },
    create: {
      childId,
      guardianUserId,
      relationship,
      status: "ACTIVE",
      createdByUserId: session.userId,
    },
    update: { relationship, status: "ACTIVE" },
  });

  if (setAsMain) {
    await prisma.child.update({
      where: { id: childId },
      data: { mainResponsibleId: guardianUserId },
    });
  }

  revalidatePath(`/admin/pacientes/${childId}/familia`);
  return { ok: true };
}

/** Desativa um vínculo de responsável (status INACTIVE — nunca apaga). */
export async function deactivateGuardianLinkAction(
  formData: FormData,
): Promise<void> {
  const session = await getAdminSession();
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  const childId = String(formData.get("childId") ?? "");
  if (!id) return;

  await prisma.childGuardianLink.updateMany({
    where: { id, child: { organizationId: session.organizationId } },
    data: { status: "INACTIVE" },
  });

  // Se o desativado era o responsável principal, limpa a referência.
  if (childId) {
    const link = await prisma.childGuardianLink.findUnique({
      where: { id },
      select: { guardianUserId: true },
    });
    if (link) {
      await prisma.child.updateMany({
        where: {
          id: childId,
          organizationId: session.organizationId,
          mainResponsibleId: link.guardianUserId,
        },
        data: { mainResponsibleId: null },
      });
    }
  }

  revalidatePath(`/admin/pacientes/${childId}/familia`);
}

/** Define (ou troca) o responsável principal do paciente. */
export async function setMainResponsibleAction(
  formData: FormData,
): Promise<void> {
  const session = await getAdminSession();
  if (!session) return;

  const childId = String(formData.get("childId") ?? "");
  const guardianUserId = String(formData.get("guardianUserId") ?? "");
  if (!childId || !guardianUserId) return;

  // Só permite definir quem tem vínculo ACTIVE com a criança.
  const link = await prisma.childGuardianLink.findFirst({
    where: {
      childId,
      guardianUserId,
      status: "ACTIVE",
      child: { organizationId: session.organizationId },
    },
    select: { id: true },
  });
  if (!link) return;

  await prisma.child.updateMany({
    where: { id: childId, organizationId: session.organizationId },
    data: { mainResponsibleId: guardianUserId },
  });

  revalidatePath(`/admin/pacientes/${childId}/familia`);
}
