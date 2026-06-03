import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Healthcheck nunca deve ser cacheado — reflete o estado atual do servidor/DB.
export const dynamic = "force-dynamic";

/**
 * Endpoint de verificação de saúde para proxies, load balancers e monitoração.
 * Retorna 200 quando a aplicação e o banco respondem; 503 se o banco falha.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up", timestamp });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", timestamp },
      { status: 503 },
    );
  }
}
