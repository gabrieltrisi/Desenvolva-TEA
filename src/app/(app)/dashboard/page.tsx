import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { FamilyDashboard } from "./family-dashboard";
import { GenericDashboard } from "./generic-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  // Painel rico e gamificado para a família; visão geral para os demais perfis.
  if (session.role === "FAMILIA") {
    const { childId } = await searchParams;
    return <FamilyDashboard session={session} selectedChildId={childId} />;
  }
  return <GenericDashboard session={session} />;
}
