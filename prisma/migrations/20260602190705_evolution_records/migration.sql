-- CreateEnum
CREATE TYPE "EvolutionCategory" AS ENUM ('GENERAL', 'THERAPY', 'HOME', 'SCHOOL', 'ROUTINE');

-- CreateTable
CREATE TABLE "evolution_records" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "EvolutionCategory" NOT NULL DEFAULT 'GENERAL',
    "note" TEXT,
    "performance" INTEGER NOT NULL,
    "mood" INTEGER NOT NULL,
    "social" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "sleep" INTEGER NOT NULL,
    "feeding" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "evolution_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evolution_records_childId_date_idx" ON "evolution_records"("childId", "date");

-- CreateIndex
CREATE INDEX "evolution_records_authorId_idx" ON "evolution_records"("authorId");

-- AddForeignKey
ALTER TABLE "evolution_records" ADD CONSTRAINT "evolution_records_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_records" ADD CONSTRAINT "evolution_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
