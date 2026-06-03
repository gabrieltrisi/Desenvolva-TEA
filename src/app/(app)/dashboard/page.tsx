import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { FamilyDashboard } from "./family-dashboard";
import { GenericDashboard } from "./generic-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  // Painel rico e gamificado para a família; visão geral para os demais perfis.
  if (session.role === "FAMILIA") {
    return <FamilyDashboard session={session} />;
  }
  return <GenericDashboard session={session} />;
}
