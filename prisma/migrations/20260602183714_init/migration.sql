-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FAMILIA', 'PROFISSIONAL', 'PREFEITURA');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ARTICLE', 'VIDEO', 'ACTIVITY', 'GUIDE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DevelopmentDomain" AS ENUM ('COMMUNICATION', 'SOCIAL', 'MOTOR', 'COGNITIVE', 'BEHAVIORAL', 'AUTONOMY');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MetricKey" AS ENUM ('COMMUNICATION', 'SOCIAL_INTERACTION', 'SLEEP_QUALITY', 'CRISIS_FREQUENCY', 'COGNITIVE', 'DAILY_ROUTINE');

-- CreateEnum
CREATE TYPE "EvolutionPeriod" AS ENUM ('WEEK', 'MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FAMILIA',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "diagnosisNote" TEXT,
    "supportLevel" INTEGER,
    "avatarColor" TEXT NOT NULL DEFAULT '#5B8DEF',
    "accompaniedSince" TIMESTAMP(3),
    "planActive" BOOLEAN NOT NULL DEFAULT true,
    "overallEvolution" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "therapistId" TEXT,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" "DevelopmentDomain" NOT NULL,
    "coverColor" TEXT NOT NULL DEFAULT '#34C7A0',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "learning_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "track_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_enrollments" (
    "id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "track_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" TEXT,
    "type" "ContentType" NOT NULL DEFAULT 'ARTICLE',
    "url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_entries" (
    "id" TEXT NOT NULL,
    "domain" "DevelopmentDomain" NOT NULL,
    "score" INTEGER NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "therapy_sessions" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,

    CONSTRAINT "therapy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_metrics" (
    "id" TEXT NOT NULL,
    "key" "MetricKey" NOT NULL,
    "value" INTEGER NOT NULL,
    "trend" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "child_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_points" (
    "id" TEXT NOT NULL,
    "period" "EvolutionPeriod" NOT NULL DEFAULT 'WEEK',
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "evolution_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childId" TEXT NOT NULL,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChildGuardians" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChildGuardians_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "children_organizationId_idx" ON "children"("organizationId");

-- CreateIndex
CREATE INDEX "children_therapistId_idx" ON "children"("therapistId");

-- CreateIndex
CREATE INDEX "learning_tracks_organizationId_idx" ON "learning_tracks"("organizationId");

-- CreateIndex
CREATE INDEX "track_modules_trackId_idx" ON "track_modules"("trackId");

-- CreateIndex
CREATE INDEX "track_enrollments_childId_idx" ON "track_enrollments"("childId");

-- CreateIndex
CREATE INDEX "track_enrollments_trackId_idx" ON "track_enrollments"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "track_enrollments_childId_trackId_key" ON "track_enrollments"("childId", "trackId");

-- CreateIndex
CREATE INDEX "contents_organizationId_idx" ON "contents"("organizationId");

-- CreateIndex
CREATE INDEX "progress_entries_childId_idx" ON "progress_entries"("childId");

-- CreateIndex
CREATE INDEX "progress_entries_authorId_idx" ON "progress_entries"("authorId");

-- CreateIndex
CREATE INDEX "therapy_sessions_childId_idx" ON "therapy_sessions"("childId");

-- CreateIndex
CREATE INDEX "achievements_childId_idx" ON "achievements"("childId");

-- CreateIndex
CREATE INDEX "child_metrics_childId_idx" ON "child_metrics"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "child_metrics_childId_key_key" ON "child_metrics"("childId", "key");

-- CreateIndex
CREATE INDEX "evolution_points_childId_period_idx" ON "evolution_points"("childId", "period");

-- CreateIndex
CREATE INDEX "xp_events_childId_idx" ON "xp_events"("childId");

-- CreateIndex
CREATE INDEX "_ChildGuardians_B_index" ON "_ChildGuardians"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_tracks" ADD CONSTRAINT "learning_tracks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_modules" ADD CONSTRAINT "track_modules_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "learning_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_enrollments" ADD CONSTRAINT "track_enrollments_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_enrollments" ADD CONSTRAINT "track_enrollments_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "learning_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapy_sessions" ADD CONSTRAINT "therapy_sessions_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_metrics" ADD CONSTRAINT "child_metrics_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_points" ADD CONSTRAINT "evolution_points_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChildGuardians" ADD CONSTRAINT "_ChildGuardians_A_fkey" FOREIGN KEY ("A") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChildGuardians" ADD CONSTRAINT "_ChildGuardians_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
