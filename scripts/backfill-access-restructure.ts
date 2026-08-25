/**
 * Backfill da Fase 1 (reestruturação de acesso por entidades). IDEMPOTENTE.
 *
 * Para cada Organization:
 *  - garante uma Municipality padrão "Prefeitura de Salvador";
 *  - associa usuários PREFEITURA sem município a ela;
 *  - cria ChildMunicipalityLink APPROVED para cada criança (se ainda não houver);
 *  - migra a relação antiga Child.guardians -> ChildGuardianLink ACTIVE;
 *  - define Child.mainResponsibleId = primeiro guardião (se vazio).
 *
 * Rodar com DATABASE_URL apontando para o banco alvo (ex.: a DIRECT do Neon).
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  let munisCreated = 0,
    prefAssoc = 0,
    muniLinks = 0,
    guardianLinks = 0,
    mainResp = 0;

  for (const org of orgs) {
    // 1) Municipality padrão (idempotente por nome dentro da org).
    let muni = await prisma.municipality.findFirst({
      where: { organizationId: org.id, name: "Prefeitura de Salvador" },
    });
    if (!muni) {
      muni = await prisma.municipality.create({
        data: {
          name: "Prefeitura de Salvador",
          city: "Salvador",
          state: "BA",
          organizationId: org.id,
        },
      });
      munisCreated++;
    }

    // Ator do sistema p/ os campos requestedBy/approvedBy/createdBy.
    const actor =
      (await prisma.user.findFirst({
        where: { organizationId: org.id, role: "ADMIN" },
        select: { id: true },
      })) ??
      (await prisma.user.findFirst({
        where: { organizationId: org.id },
        select: { id: true },
      }));
    if (!actor) continue; // org sem usuários (não deve ocorrer)

    // 2) PREFEITURA sem município -> município padrão da org.
    const r = await prisma.user.updateMany({
      where: { organizationId: org.id, role: "PREFEITURA", municipalityId: null },
      data: { municipalityId: muni.id },
    });
    prefAssoc += r.count;

    // 3) Crianças: vínculo município APPROVED + guardian links + mainResponsible.
    const children = await prisma.child.findMany({
      where: { organizationId: org.id },
      select: {
        id: true,
        mainResponsibleId: true,
        guardians: { select: { id: true } },
        municipalityLinks: { select: { municipalityId: true } },
        guardianLinks: { select: { guardianUserId: true } },
      },
    });

    for (const child of children) {
      if (!child.municipalityLinks.some((l) => l.municipalityId === muni!.id)) {
        await prisma.childMunicipalityLink.create({
          data: {
            childId: child.id,
            municipalityId: muni!.id,
            status: "APPROVED",
            requestedByUserId: actor.id,
            approvedByUserId: actor.id,
            approvedAt: new Date(),
          },
        });
        muniLinks++;
      }

      for (const g of child.guardians) {
        if (!child.guardianLinks.some((gl) => gl.guardianUserId === g.id)) {
          await prisma.childGuardianLink.create({
            data: {
              childId: child.id,
              guardianUserId: g.id,
              relationship: "GUARDIAN",
              status: "ACTIVE",
              createdByUserId: actor.id,
            },
          });
          guardianLinks++;
        }
      }

      if (!child.mainResponsibleId && child.guardians[0]) {
        await prisma.child.update({
          where: { id: child.id },
          data: { mainResponsibleId: child.guardians[0].id },
        });
        mainResp++;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        orgs: orgs.length,
        municipiosCriados: munisCreated,
        prefeiturasAssociadas: prefAssoc,
        vinculosMunicipioCriados: muniLinks,
        vinculosGuardiaoCriados: guardianLinks,
        mainResponsibleDefinidos: mainResp,
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("BACKFILL_ERR", e?.message ?? e);
  process.exit(1);
});
