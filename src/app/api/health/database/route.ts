import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/database-health";

// Reflete o estado atual da conexão — nunca cacheado.
export const dynamic = "force-dynamic";

/**
 * Health check dedicado ao banco de dados.
 * 200 → { status: "healthy" }
 * 503 → { status: "unhealthy", reason: "database_unreachable" }
 */
export async function GET() {
  const result = await checkDatabaseConnection();

  if (result.ok) {
    return NextResponse.json({ status: "healthy" });
  }

  return NextResponse.json(
    { status: "unhealthy", reason: result.reason },
    { status: 503 },
  );
}
