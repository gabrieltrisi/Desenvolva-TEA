import type { PrismaClient } from "../src/generated/prisma/client";

/**
 * Demonstração multi-prefeitura (Fase 6). 100% IDEMPOTENTE e ADITIVO:
 *  - garante 4 municípios (Salvador, Camaçari, Lauro de Freitas, Feira de Santana);
 *  - garante 1 usuário PREFEITURA por município (+ mantém o login legado);
 *  - redistribui as crianças pré-existentes: exatamente UM vínculo APPROVED cada;
 *  - cria pacientes PENDING (para demonstrar aprovação);
 *  - cria famílias de exemplo (Maria Angélica → Gabriel Trisi, + 1 por município).
 *
 * Não apaga nada; vínculos APPROVED antigos que sobram viram REJECTED
 * (preserva histórico sem violar "no máximo um APPROVED por criança").
 */

export interface MunicipalitiesDemoResult {
  municipalities: number;
  prefeituraUsers: number;
  childrenRedistributed: number;
  approvedByMunicipality: Record<string, number>;
  pendingCreated: number;
  familiesCreated: number;
}

const STATE = "BA";

const MUNI = [
  { key: "salvador", name: "Prefeitura de Salvador", city: "Salvador" },
  { key: "camacari", name: "Prefeitura de Camaçari", city: "Camaçari" },
  { key: "lauro", name: "Prefeitura de Lauro de Freitas", city: "Lauro de Freitas" },
  { key: "feira", name: "Prefeitura de Feira de Santana", city: "Feira de Santana" },
] as const;
type MuniKey = (typeof MUNI)[number]["key"];

const PREFEITURA_USERS: { key: MuniKey; name: string; email: string }[] = [
  { key: "salvador", name: "Gestor Salvador", email: "prefeitura-salvador@desenvolvatea.com" },
  { key: "camacari", name: "Gestor Camaçari", email: "prefeitura-camacari@desenvolvatea.com" },
  { key: "lauro", name: "Gestor Lauro de Freitas", email: "prefeitura-lauro@desenvolvatea.com" },
  { key: "feira", name: "Gestor Feira de Santana", email: "prefeitura-feira@desenvolvatea.com" },
];

// Distribuição determinística por índice (Salvador maioria).
const WEIGHT_PATTERN: MuniKey[] = [
  "salvador", "salvador", "salvador", "salvador", "salvador", "salvador",
  "camacari", "camacari", "lauro", "feira",
];

const COLORS = ["#1cab88", "#5b8def", "#f97f3a", "#9b5bef", "#ef5b8d"];

// Pacientes PENDING (novos, sem APPROVED) para demonstrar aprovação.
const PENDING_CHILDREN: { name: string; muni: MuniKey; level: number }[] = [
  { name: "Heitor (aguardando Salvador)", muni: "salvador", level: 1 },
  { name: "Lara (aguardando Salvador)", muni: "salvador", level: 2 },
  { name: "Enzo (aguardando Camaçari)", muni: "camacari", level: 2 },
  { name: "Cecília (aguardando Camaçari)", muni: "camacari", level: 3 },
  { name: "Bento (aguardando Lauro)", muni: "lauro", level: 1 },
];

// Famílias de exemplo: (usuário família) → (criança) aprovada em um município.
const FAMILIES: {
  userName: string;
  email: string;
  childName: string;
  level: number;
  muni: MuniKey;
}[] = [
  { userName: "Maria Angélica", email: "maria.angelica@desenvolvatea.com", childName: "Gabriel Trisi", level: 2, muni: "salvador" },
  { userName: "Joana Camaçari", email: "familia.camacari@desenvolvatea.com", childName: "Lucas Camaçari", level: 1, muni: "camacari" },
  { userName: "Paula Lauro", email: "familia.lauro@desenvolvatea.com", childName: "Sofia Lauro", level: 2, muni: "lauro" },
  { userName: "Rita Feira", email: "familia.feira@desenvolvatea.com", childName: "Pedro Feira", level: 3, muni: "feira" },
];

const ALL_DEMO_CHILD_NAMES = new Set<string>([
  ...PENDING_CHILDREN.map((c) => c.name),
  ...FAMILIES.map((f) => f.childName),
]);

export async function seedMunicipalitiesDemo(
  prisma: PrismaClient,
  orgId: string,
  passwordHash: string,
): Promise<MunicipalitiesDemoResult> {
  const now = new Date();

  // Ator do sistema (requestedBy/approvedBy/createdBy).
  const admin =
    (await prisma.user.findFirst({
      where: { organizationId: orgId, role: "ADMIN" },
      select: { id: true },
    })) ??
    (await prisma.user.findFirst({
      where: { organizationId: orgId },
      select: { id: true },
    }));
  if (!admin) throw new Error("Organização sem usuários — rode o seed base antes.");

  const therapist = await prisma.user.findFirst({
    where: { organizationId: orgId, role: "PROFISSIONAL" },
    select: { id: true },
  });

  // 1) Municípios (idempotente por nome dentro da org).
  const muniId: Record<MuniKey, string> = {} as Record<MuniKey, string>;
  let municipalitiesCount = 0;
  for (const m of MUNI) {
    let muni = await prisma.municipality.findFirst({
      where: { organizationId: orgId, name: m.name },
      select: { id: true },
    });
    if (!muni) {
      muni = await prisma.municipality.create({
        data: { name: m.name, city: m.city, state: STATE, active: true, organizationId: orgId },
        select: { id: true },
      });
    } else {
      await prisma.municipality.update({ where: { id: muni.id }, data: { active: true } });
    }
    muniId[m.key] = muni.id;
    municipalitiesCount++;
  }

  // 2) Usuários PREFEITURA por município (+ mantém o login legado em Salvador).
  const prefUserId: Record<MuniKey, string> = {} as Record<MuniKey, string>;
  let prefeituraUsers = 0;
  for (const p of PREFEITURA_USERS) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { municipalityId: muniId[p.key], role: "PREFEITURA", active: true },
      create: {
        name: p.name,
        email: p.email,
        passwordHash,
        role: "PREFEITURA",
        active: true,
        organizationId: orgId,
        municipalityId: muniId[p.key],
      },
      select: { id: true },
    });
    prefUserId[p.key] = user.id;
    prefeituraUsers++;
  }
  // Login legado segue vinculado a Salvador (compatibilidade).
  await prisma.user.updateMany({
    where: { email: "prefeitura@desenvolvatea.com", organizationId: orgId },
    data: { municipalityId: muniId.salvador },
  });

  // Garante exatamente UM vínculo APPROVED para a criança → muni alvo.
  async function ensureSingleApproved(childId: string, targetMuniId: string) {
    const existing = await prisma.childMunicipalityLink.findFirst({
      where: { childId, municipalityId: targetMuniId },
      select: { id: true, status: true },
    });
    if (!existing) {
      await prisma.childMunicipalityLink.create({
        data: {
          childId,
          municipalityId: targetMuniId,
          status: "APPROVED",
          requestedByUserId: admin!.id,
          approvedByUserId: admin!.id,
          approvedAt: now,
        },
      });
    } else if (existing.status !== "APPROVED") {
      await prisma.childMunicipalityLink.update({
        where: { id: existing.id },
        data: { status: "APPROVED", approvedByUserId: admin!.id, approvedAt: now },
      });
    }
    // Demove outros APPROVED (preserva histórico como REJECTED).
    await prisma.childMunicipalityLink.updateMany({
      where: { childId, municipalityId: { not: targetMuniId }, status: "APPROVED" },
      data: {
        status: "REJECTED",
        rejectedAt: now,
        rejectionReason: "Reorganização da rede (demonstração)",
      },
    });
  }

  // 3) Redistribui crianças pré-existentes (exclui as crianças de demonstração).
  const existing = await prisma.child.findMany({
    where: { organizationId: orgId },
    orderBy: { id: "asc" },
    select: { id: true, name: true },
  });
  const redistributable = existing.filter((c) => !ALL_DEMO_CHILD_NAMES.has(c.name));
  const approvedByMunicipality: Record<string, number> = {
    salvador: 0, camacari: 0, lauro: 0, feira: 0,
  };
  let i = 0;
  for (const child of redistributable) {
    const key = WEIGHT_PATTERN[i % WEIGHT_PATTERN.length];
    await ensureSingleApproved(child.id, muniId[key]);
    approvedByMunicipality[key]++;
    i++;
  }

  // 4) Pacientes PENDING (novos; sem APPROVED).
  let pendingCreated = 0;
  for (const [idx, pc] of PENDING_CHILDREN.entries()) {
    let child = await prisma.child.findFirst({
      where: { organizationId: orgId, name: pc.name },
      select: { id: true },
    });
    if (!child) {
      child = await prisma.child.create({
        data: {
          name: pc.name,
          birthDate: new Date(2018, idx % 12, 10),
          supportLevel: pc.level,
          avatarColor: COLORS[idx % COLORS.length],
          organizationId: orgId,
        },
        select: { id: true },
      });
    }
    const link = await prisma.childMunicipalityLink.findFirst({
      where: { childId: child.id, municipalityId: muniId[pc.muni] },
      select: { id: true },
    });
    if (!link) {
      await prisma.childMunicipalityLink.create({
        data: {
          childId: child.id,
          municipalityId: muniId[pc.muni],
          status: "PENDING",
          requestedByUserId: prefUserId[pc.muni],
        },
      });
      pendingCreated++;
    }
  }

  // 5) Famílias de exemplo (usuário FAMÍLIA → criança APPROVED no município).
  let familiesCreated = 0;
  for (const [idx, fam] of FAMILIES.entries()) {
    const guardian = await prisma.user.upsert({
      where: { email: fam.email },
      update: { role: "FAMILIA", active: true },
      create: {
        name: fam.userName,
        email: fam.email,
        passwordHash,
        role: "FAMILIA",
        active: true,
        organizationId: orgId,
      },
      select: { id: true },
    });

    let child = await prisma.child.findFirst({
      where: { organizationId: orgId, name: fam.childName },
      select: { id: true },
    });
    if (!child) {
      child = await prisma.child.create({
        data: {
          name: fam.childName,
          birthDate: new Date(2016, (idx * 3) % 12, 15),
          supportLevel: fam.level,
          avatarColor: COLORS[idx % COLORS.length],
          accompaniedSince: new Date(2024, 0, 1),
          overallEvolution: 70,
          organizationId: orgId,
          therapistId: therapist?.id ?? null,
          mainResponsibleId: guardian.id,
          guardians: { connect: { id: guardian.id } },
        },
        select: { id: true },
      });
      familiesCreated++;
    } else {
      await prisma.child.update({
        where: { id: child.id },
        data: { mainResponsibleId: guardian.id },
      });
    }

    // Vínculo de guardião ACTIVE (idempotente por par único).
    await prisma.childGuardianLink.upsert({
      where: { childId_guardianUserId: { childId: child.id, guardianUserId: guardian.id } },
      update: { status: "ACTIVE", relationship: "MOTHER" },
      create: {
        childId: child.id,
        guardianUserId: guardian.id,
        relationship: "MOTHER",
        status: "ACTIVE",
        createdByUserId: admin!.id,
      },
    });

    // Vínculo de município APPROVED.
    await ensureSingleApproved(child.id, muniId[fam.muni]);
  }

  return {
    municipalities: municipalitiesCount,
    prefeituraUsers,
    childrenRedistributed: redistributable.length,
    approvedByMunicipality,
    pendingCreated,
    familiesCreated,
  };
}
