-- CreateEnum
CREATE TYPE "ReportKind" AS ENUM ('CHILD', 'MUNICIPAL');

-- CreateTable
CREATE TABLE "content_views" (
    "id" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "content_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_emissions" (
    "id" TEXT NOT NULL,
    "kind" "ReportKind" NOT NULL DEFAULT 'CHILD',
    "emittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "report_emissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_views_organizationId_viewedAt_idx" ON "content_views"("organizationId", "viewedAt");

-- CreateIndex
CREATE INDEX "content_views_contentId_idx" ON "content_views"("contentId");

-- CreateIndex
CREATE INDEX "report_emissions_organizationId_emittedAt_idx" ON "report_emissions"("organizationId", "emittedAt");

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_emissions" ADD CONSTRAINT "report_emissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
