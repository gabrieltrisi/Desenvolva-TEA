"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { evolutionRecordSchema } from "./schema";
import { recomputeChildMetrics } from "./metrics";
import { canAccessChild } from "./access";

export interface EvolutionFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createEvolutionRecordAction(
  _prev: EvolutionFormState,
  formData: FormData,
): Promise<EvolutionFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = evolutionRecordSchema.safeParse({
    childId: formData.get("childId"),
    date: formData.get("date"),
    category: formData.get("category"),
    note: formData.get("note"),
    performance: formData.get("performance"),
    mood: formData.get("mood"),
    social: formData.get("social"),
    communication: formData.get("communication"),
    sleep: formData.get("sleep"),
    feeding: formData.get("feeding"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Revise os campos destacados.", fieldErrors };
  }

  const data = parsed.data;

  if (!(await canAccessChild(session, data.childId))) {
    return { error: "Você não tem acesso a esta criança." };
  }

  await prisma.evolutionRecord.create({
    data: {
      childId: data.childId,
      authorId: session.userId,
      date: data.date,
      category: data.category,
      note: data.note ?? null,
      performance: data.performance,
      mood: data.mood,
      social: data.social,
      communication: data.communication,
      sleep: data.sleep,
      feeding: data.feeding,
    },
  });

  // Atualiza automaticamente as métricas do painel.
  await recomputeChildMetrics(prisma, data.childId);

  revalidatePath("/acompanhamento");
  revalidatePath("/dashboard");
  redirect(`/acompanhamento?childId=${data.childId}`);
}
