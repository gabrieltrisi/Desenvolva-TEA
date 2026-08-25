"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { canCreateChild } from "@/lib/auth/routes";
import { resolveAccessUser } from "@/lib/access/children";
import type { Prisma } from "@/generated/prisma/client";

const AVATAR_COLORS = [
  "#1cab88",
  "#5b8def",
  "#f97f3a",
  "#9b5bef",
  "#ef5b8d",
  "#3ac7b8",
];

export interface ChildFormState {
  error?: string;
}

export async function createChildAction(
  _prev: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  // Bloqueio server-side: FAMÍLIA/PROFISSIONAL não criam crianças, mesmo que
  // chamem a action diretamente.
  if (!canCreateChild(session.role)) {
    return { error: "Seu perfil não tem permissão para cadastrar crianças." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const birthDateRaw = String(formData.get("birthDate") ?? "");
  const supportLevelRaw = String(formData.get("supportLevel") ?? "");
  const diagnosisNote = String(formData.get("diagnosisNote") ?? "").trim();

  if (!name || !birthDateRaw) {
    return { error: "Informe ao menos o nome e a data de nascimento." };
  }

  const birthDate = new Date(birthDateRaw);
  if (Number.isNaN(birthDate.getTime())) {
    return { error: "Data de nascimento inválida." };
  }

  const color =
    AVATAR_COLORS[Math.floor(name.length % AVATAR_COLORS.length)];

  const user = await resolveAccessUser(session);

  // Prefeitura precisa de município para gerar o vínculo de aprovação.
  if (user.role === "PREFEITURA" && !user.municipalityId) {
    return {
      error: "Sua conta de prefeitura não está vinculada a um município.",
    };
  }

  // Vínculos por papel (apenas ADMIN e PREFEITURA chegam aqui):
  //  - PREFEITURA: ChildMunicipalityLink PENDING (visível só após aprovação do ADMIN).
  //  - ADMIN: criança da organização, sem vínculo automático.
  const roleData: Partial<Pick<Prisma.ChildCreateInput, "municipalityLinks">> =
    user.role === "PREFEITURA" && user.municipalityId
      ? {
          municipalityLinks: {
            create: {
              municipality: { connect: { id: user.municipalityId } },
              requestedBy: { connect: { id: user.userId } },
              status: "PENDING",
            },
          },
        }
      : {};

  await prisma.child.create({
    data: {
      name,
      birthDate,
      diagnosisNote: diagnosisNote || null,
      supportLevel: supportLevelRaw ? Number(supportLevelRaw) : null,
      avatarColor: color,
      organization: { connect: { id: session.organizationId } },
      ...roleData,
    },
  });

  revalidatePath("/criancas");
  redirect("/criancas");
}
