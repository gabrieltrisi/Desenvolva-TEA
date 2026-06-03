"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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

  await prisma.child.create({
    data: {
      name,
      birthDate,
      diagnosisNote: diagnosisNote || null,
      supportLevel: supportLevelRaw ? Number(supportLevelRaw) : null,
      avatarColor: color,
      organizationId: session.organizationId,
      // Se for família, já vincula como responsável.
      guardians:
        session.role === "FAMILIA"
          ? { connect: { id: session.userId } }
          : undefined,
    },
  });

  revalidatePath("/criancas");
  redirect("/criancas");
}
