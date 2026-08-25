-- CreateEnum
CREATE TYPE "ContentSpecialty" AS ENUM ('FONOAUDIOLOGIA', 'NEUROLOGIA', 'NUTRICAO', 'PSICOLOGIA', 'TERAPIA_OCUPACIONAL');

-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "specialty" "ContentSpecialty",
ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE INDEX "contents_organizationId_specialty_idx" ON "contents"("organizationId", "specialty");
