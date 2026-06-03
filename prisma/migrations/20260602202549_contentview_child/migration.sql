-- AlterTable
ALTER TABLE "content_views" ADD COLUMN     "childId" TEXT;

-- CreateIndex
CREATE INDEX "content_views_childId_idx" ON "content_views"("childId");

-- AddForeignKey
ALTER TABLE "content_views" ADD CONSTRAINT "content_views_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;
