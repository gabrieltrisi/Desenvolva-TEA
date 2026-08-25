-- CreateEnum
CREATE TYPE "ChildLinkStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GuardianRelationship" AS ENUM ('MOTHER', 'FATHER', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "GuardianLinkStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "children" ADD COLUMN     "mainResponsibleId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "municipalityId" TEXT;

-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cnpj" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_municipality_links" (
    "id" TEXT NOT NULL,
    "status" "ChildLinkStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "approvedByUserId" TEXT,

    CONSTRAINT "child_municipality_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_guardian_links" (
    "id" TEXT NOT NULL,
    "relationship" "GuardianRelationship" NOT NULL DEFAULT 'GUARDIAN',
    "status" "GuardianLinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "guardianUserId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "child_guardian_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "municipalities_organizationId_idx" ON "municipalities"("organizationId");

-- CreateIndex
CREATE INDEX "child_municipality_links_municipalityId_status_idx" ON "child_municipality_links"("municipalityId", "status");

-- CreateIndex
CREATE INDEX "child_municipality_links_childId_status_idx" ON "child_municipality_links"("childId", "status");

-- CreateIndex
CREATE INDEX "child_guardian_links_guardianUserId_status_idx" ON "child_guardian_links"("guardianUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "child_guardian_links_childId_guardianUserId_key" ON "child_guardian_links"("childId", "guardianUserId");

-- CreateIndex
CREATE INDEX "children_mainResponsibleId_idx" ON "children"("mainResponsibleId");

-- CreateIndex
CREATE INDEX "users_municipalityId_idx" ON "users"("municipalityId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_mainResponsibleId_fkey" FOREIGN KEY ("mainResponsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_municipality_links" ADD CONSTRAINT "child_municipality_links_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_municipality_links" ADD CONSTRAINT "child_municipality_links_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_municipality_links" ADD CONSTRAINT "child_municipality_links_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_municipality_links" ADD CONSTRAINT "child_municipality_links_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_guardian_links" ADD CONSTRAINT "child_guardian_links_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_guardian_links" ADD CONSTRAINT "child_guardian_links_guardianUserId_fkey" FOREIGN KEY ("guardianUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_guardian_links" ADD CONSTRAINT "child_guardian_links_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
