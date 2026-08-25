/**
 * Aplica APENAS a demonstração multi-prefeitura (Fase 6) ao banco alvo, de forma
 * idempotente, sem rodar o seed completo. Rodar com DATABASE_URL apontando para
 * o banco (ex.: a DIRECT do Neon).
 */
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedMunicipalitiesDemo } from "../prisma/municipalities-demo";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash("senha123", 10);
  const org = await prisma.organization.findFirst({
    where: { slug: "default" },
    select: { id: true },
  });
  if (!org) throw new Error('Organização "default" não encontrada.');

  const result = await seedMunicipalitiesDemo(prisma, org.id, passwordHash);
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error("ERRO:", e?.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
