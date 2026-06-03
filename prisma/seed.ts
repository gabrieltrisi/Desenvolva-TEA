import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { recomputeChildMetrics } from "../src/lib/evolution/metrics";
import { seedDemo } from "./demo";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Próxima ocorrência de um dia da semana (0=dom..6=sáb) em determinada hora. */
function nextWeekday(weekday: number, hour: number): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** PRNG determinístico (mulberry32) para um seed reproduzível. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Miguel", "Sophia", "Arthur", "Helena", "Bernardo", "Valentina", "Heitor",
  "Laura", "Davi", "Isabella", "Lorenzo", "Manuela", "Théo", "Júlia", "Pedro",
  "Alice", "Gabriel", "Luiza", "Benjamin", "Cecília", "Matheus", "Lara",
  "Rafael", "Maria", "Enzo", "Lívia", "Nicolas", "Beatriz", "Gustavo", "Antonella",
];
const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Almeida",
  "Nascimento", "Araújo", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha",
  "Barbosa", "Alves", "Mendes", "Cardoso", "Teixeira",
];
const GUARDIAN_FIRST = [
  "Ana", "Carlos", "Patrícia", "Marcos", "Fernanda", "Roberto", "Juliana",
  "Paulo", "Camila", "Rodrigo", "Aline", "Bruno", "Sandra", "Felipe", "Renata",
];
const THERAPIST_NAMES = [
  "Dra. Carla Mendes", "Dr. João Lima", "Dra. Beatriz Souza", "Dr. André Costa",
  "Dra. Marina Alves", "Dr. Rafael Pinto", "Dra. Letícia Rocha", "Dr. Bruno Dias",
];

async function main() {
  const passwordHash = await bcrypt.hash("senha123", 10);

  // --- Organização (tenant) ---
  const org = await prisma.organization.upsert({
    where: { slug: "default" },
    update: {},
    create: { name: "Organização Demonstração", slug: "default" },
  });

  // --- Usuários ---
  const usersData = [
    { name: "Admin Geral", email: "admin@desenvolvatea.com", role: "ADMIN" as const },
    { name: "Maria Família", email: "familia@desenvolvatea.com", role: "FAMILIA" as const },
    { name: "Dra. Carla Mendes", email: "carla@desenvolvatea.com", role: "PROFISSIONAL" as const },
    { name: "Dr. João Profissional", email: "profissional@desenvolvatea.com", role: "PROFISSIONAL" as const },
    { name: "Gestor Prefeitura", email: "prefeitura@desenvolvatea.com", role: "PREFEITURA" as const },
  ];

  const users: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash, organizationId: org.id },
    });
    users[u.email] = user.id;
  }
  const therapistId = users["carla@desenvolvatea.com"];
  const familiaId = users["familia@desenvolvatea.com"];

  // --- Criança principal do painel: Miguel Alves ---
  let miguel = await prisma.child.findFirst({
    where: { name: "Miguel Alves", organizationId: org.id },
  });
  if (!miguel) {
    miguel = await prisma.child.create({
      data: {
        name: "Miguel Alves",
        birthDate: new Date("2017-05-10"), // ~8 anos
        supportLevel: 1,
        avatarColor: "#5b8def",
        accompaniedSince: daysAgo(365 * 2 + 30), // ~2 anos (margem p/ arredondamento)
        planActive: true,
        overallEvolution: 78,
        organizationId: org.id,
        therapistId,
        guardians: { connect: { id: familiaId } },
      },
    });
  }

  // Crianças adicionais (para listagens) ---
  const extraChildren = [
    { name: "Helena Costa", birthDate: new Date("2019-09-30"), supportLevel: 2, avatarColor: "#1cab88" },
    { name: "Davi Martins", birthDate: new Date("2018-01-20"), supportLevel: 1, avatarColor: "#f97f3a" },
  ];
  for (const c of extraChildren) {
    const existing = await prisma.child.findFirst({
      where: { name: c.name, organizationId: org.id },
    });
    if (!existing) {
      await prisma.child.create({
        data: { ...c, organizationId: org.id, guardians: { connect: { id: familiaId } } },
      });
    }
  }

  // --- Dados ricos do Miguel (só se ainda não houver métricas) ---
  const hasMetrics = await prisma.childMetric.count({ where: { childId: miguel.id } });
  if (hasMetrics === 0) {
    // Registros de evolução (Sprint Evolução): ~14 registros ao longo de 60 dias,
    // em tendência de melhora. As métricas do painel são DERIVADAS daqui (recompute).
    const authors = [therapistId, familiaId];
    const cats = ["THERAPY", "HOME", "SCHOOL", "ROUTINE", "GENERAL"] as const;
    const lerp = (lo: number, hi: number, t: number) =>
      Math.min(5, Math.max(1, Math.round(lo + (hi - lo) * t)));

    const recordsData = Array.from({ length: 14 }, (_, idx) => {
      const i = 13 - idx; // 13 (mais antigo) -> 0 (mais novo)
      const t = idx / 13; // 0..1 (cresce com o tempo)
      const daysBack = i * 4; // 52..0 dias atrás
      return {
        childId: miguel!.id,
        authorId: authors[idx % authors.length],
        date: daysAgo(daysBack),
        category: cats[idx % cats.length],
        note:
          idx === 13
            ? "Ótima semana: iniciou pedidos espontâneos e dormiu melhor."
            : idx === 10
              ? "Dia agitado na escola, mas boa interação na terapia."
              : null,
        communication: lerp(3, 4, t),
        social: lerp(2, 4, t),
        sleep: lerp(3, 4, t),
        performance: lerp(3, 4, t),
        feeding: lerp(3, 5, t),
        mood: lerp(2, 4, t),
      };
    });
    await prisma.evolutionRecord.createMany({ data: recordsData });

    // Métricas do painel derivadas dos registros acima.
    await recomputeChildMetrics(prisma, miguel.id);

    // Histórico de evolução (3 períodos).
    const week = [
      ["Seg", 70], ["Ter", 72], ["Qua", 60], ["Qui", 82],
      ["Sex", 68], ["Sáb", 88], ["Dom", 92],
    ] as const;
    const month = [["S1", 62], ["S2", 70], ["S3", 75], ["S4", 78]] as const;
    const year = [
      ["Jan", 40], ["Fev", 45], ["Mar", 50], ["Abr", 55], ["Mai", 58], ["Jun", 62],
      ["Jul", 65], ["Ago", 68], ["Set", 70], ["Out", 73], ["Nov", 76], ["Dez", 78],
    ] as const;
    await prisma.evolutionPoint.createMany({
      data: [
        ...week.map(([label, value], i) => ({ childId: miguel!.id, period: "WEEK" as const, order: i, label, value })),
        ...month.map(([label, value], i) => ({ childId: miguel!.id, period: "MONTH" as const, order: i, label, value })),
        ...year.map(([label, value], i) => ({ childId: miguel!.id, period: "YEAR" as const, order: i, label, value })),
      ],
    });

    // 24 sessões realizadas (semanais no passado) + próxima agendada (quinta 14h).
    const completed = Array.from({ length: 24 }, (_, i) => ({
      childId: miguel!.id,
      scheduledAt: daysAgo((24 - i) * 7),
      status: "COMPLETED" as const,
    }));
    await prisma.therapySession.createMany({
      data: [
        ...completed,
        { childId: miguel.id, scheduledAt: nextWeekday(4, 14), status: "SCHEDULED" as const, notes: "Sessão semanal" },
      ],
    });

    // 12 conquistas.
    const achievements = [
      ["Primeira palavra nova", "🗣️"], ["Rotina da manhã", "🌅"], ["Contato visual", "👀"],
      ["Brincadeira em dupla", "🤝"], ["Noite tranquila", "🌙"], ["Sem crises na semana", "🛡️"],
      ["Atividade concluída", "✅"], ["7 dias seguidos", "🔥"], ["Novo jogo", "🎮"],
      ["Leitura compartilhada", "📚"], ["Autonomia no lanche", "🍎"], ["100 XP", "⭐"],
    ] as const;
    await prisma.achievement.createMany({
      data: achievements.map(([title, icon], i) => ({
        childId: miguel!.id,
        title,
        icon,
        earnedAt: daysAgo(i * 5),
      })),
    });

    // XP da semana (soma = 68).
    await prisma.xpEvent.createMany({
      data: [
        { childId: miguel.id, amount: 20, reason: "Sessão concluída", createdAt: daysAgo(1) },
        { childId: miguel.id, amount: 15, reason: "Atividade do dia", createdAt: daysAgo(2) },
        { childId: miguel.id, amount: 18, reason: "Rotina cumprida", createdAt: daysAgo(3) },
        { childId: miguel.id, amount: 15, reason: "Conquista", createdAt: daysAgo(4) },
      ],
    });
  }

  // --- Trilhas + módulos ---
  const tracksSeed = [
    {
      title: "Primeiras Palavras",
      description: "Estímulos para ampliar o vocabulário e a comunicação funcional.",
      domain: "COMMUNICATION" as const, coverColor: "#34c7a0", order: 1,
      modules: ["Sons e imitação", "Nomeando objetos", "Pedidos e escolhas"],
    },
    {
      title: "Brincar Junto",
      description: "Atividades para desenvolver interação e habilidades sociais.",
      domain: "SOCIAL" as const, coverColor: "#5b8def", order: 2,
      modules: ["Contato visual", "Revezamento", "Brincadeiras em dupla"],
    },
    {
      title: "Rotina e Autonomia",
      description: "Apoio à construção de rotinas e independência no dia a dia.",
      domain: "AUTONOMY" as const, coverColor: "#f97f3a", order: 3,
      modules: ["Sequência da rotina", "Higiene", "Vestir-se"],
    },
  ];
  const tracks: string[] = [];
  for (const t of tracksSeed) {
    const existing = await prisma.learningTrack.findFirst({
      where: { title: t.title, organizationId: org.id },
    });
    const track =
      existing ??
      (await prisma.learningTrack.create({
        data: {
          title: t.title, description: t.description, domain: t.domain,
          coverColor: t.coverColor, order: t.order, organizationId: org.id,
          modules: { create: t.modules.map((title, i) => ({ title, order: i + 1 })) },
        },
      }));
    tracks.push(track.id);
  }

  // --- Conteúdos terapêuticos ---
  const contentsSeed = [
    { title: "Comunicação Alternativa (CAA): por onde começar", summary: "Guia introdutório sobre sistemas de comunicação por imagens.", type: "GUIDE" as const, tags: ["comunicação", "caa"] },
    { title: "Como criar rotinas visuais em casa", summary: "Passo a passo para montar quadros de rotina com a criança.", type: "ARTICLE" as const, tags: ["rotina", "autonomia"] },
    { title: "Brincadeiras sensoriais de baixo custo", summary: "Atividades práticas para regulação e exploração sensorial.", type: "ACTIVITY" as const, tags: ["sensorial", "brincar"] },
  ];
  for (const c of contentsSeed) {
    const existing = await prisma.content.findFirst({
      where: { title: c.title, organizationId: org.id },
    });
    if (!existing) await prisma.content.create({ data: { ...c, organizationId: org.id } });
  }

  // --- Matrículas + progresso do Miguel (se ainda não houver) ---
  const enrollmentCount = await prisma.trackEnrollment.count({
    where: { childId: miguel.id },
  });
  if (enrollmentCount === 0) {
    await prisma.trackEnrollment.createMany({
      data: [
        { childId: miguel.id, trackId: tracks[0], status: "IN_PROGRESS", progress: 60, startedAt: new Date() },
        { childId: miguel.id, trackId: tracks[1], status: "NOT_STARTED", progress: 0 },
      ],
    });
    await prisma.progressEntry.createMany({
      data: [
        { childId: miguel.id, authorId: therapistId, domain: "COMMUNICATION", score: 8, note: "Boa evolução nos pedidos." },
        { childId: miguel.id, authorId: therapistId, domain: "SOCIAL", score: 6 },
        { childId: miguel.id, authorId: familiaId, domain: "AUTONOMY", score: 8, note: "Já escova os dentes com apoio leve." },
      ],
    });
  }

  // =========================================================================
  // Coorte municipal (Sprint Prefeitura): 8 profissionais, 50 famílias+crianças,
  // registros de evolução, conteúdos consumidos, trilhas em andamento e emissões.
  // Idempotente: só gera se ainda não houver o coorte (@muni.).
  // =========================================================================
  const cohortExists = await prisma.user.count({
    where: { organizationId: org.id, email: { contains: "@muni." } },
  });

  if (cohortExists === 0) {
    const rng = makeRng(20260602);
    const pick = <T>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
    const randInt = (lo: number, hi: number) =>
      lo + Math.floor(rng() * (hi - lo + 1));
    const clamp5 = (n: number) => Math.max(1, Math.min(5, n));

    // 8 profissionais
    await prisma.user.createMany({
      data: Array.from({ length: 8 }, (_, i) => ({
        name: THERAPIST_NAMES[i],
        email: `prof${i + 1}@muni.desenvolvatea.com`,
        passwordHash,
        role: "PROFISSIONAL" as const,
        organizationId: org.id,
      })),
    });
    const profs = await prisma.user.findMany({
      where: { organizationId: org.id, email: { contains: "@muni." }, role: "PROFISSIONAL" },
      select: { id: true },
    });

    // Conteúdos disponíveis (para "consumidos" e "mais acessados")
    const contents = await prisma.content.findMany({
      where: { organizationId: org.id },
      select: { id: true },
    });

    const recordRows: {
      childId: string; authorId: string; date: Date; category: "GENERAL" | "THERAPY" | "HOME" | "SCHOOL" | "ROUTINE";
      performance: number; mood: number; social: number; communication: number; sleep: number; feeding: number;
    }[] = [];
    const enrollmentRows: { childId: string; trackId: string; status: "IN_PROGRESS"; progress: number; startedAt: Date }[] = [];
    const cohortChildIds: string[] = [];
    const cats = ["THERAPY", "HOME", "SCHOOL", "ROUTINE", "GENERAL"] as const;
    const levelWeights = [1, 1, 2, 2, 2, 3, null];

    for (let i = 0; i < 50; i++) {
      const childName = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`;
      const guardianName = `${pick(GUARDIAN_FIRST)} ${LAST_NAMES[(i * 7) % LAST_NAMES.length]}`;
      const therapistId = profs[i % profs.length].id;
      const age = randInt(3, 14);
      const supportLevel = levelWeights[Math.floor(rng() * levelWeights.length)];
      const overall = randInt(45, 92);

      const guardian = await prisma.user.create({
        data: {
          name: guardianName,
          email: `familia${i + 1}@muni.desenvolvatea.com`,
          passwordHash,
          role: "FAMILIA",
          organizationId: org.id,
        },
      });
      const child = await prisma.child.create({
        data: {
          name: childName,
          birthDate: daysAgo(age * 365 + randInt(0, 300)),
          supportLevel,
          avatarColor: pick(["#1cab88", "#5b8def", "#f97f3a", "#9b5bef", "#ef5b8d"]),
          accompaniedSince: daysAgo(randInt(120, 900)),
          overallEvolution: overall,
          organizationId: org.id,
          therapistId,
          guardians: { connect: { id: guardian.id } },
        },
      });
      cohortChildIds.push(child.id);

      // Registros de evolução em torno do nível geral da criança
      const base = clamp5(Math.round(overall / 20));
      const nRecords = randInt(3, 9);
      for (let r = 0; r < nRecords; r++) {
        recordRows.push({
          childId: child.id,
          authorId: therapistId,
          date: daysAgo(randInt(0, 120)),
          category: pick(cats),
          performance: clamp5(base + randInt(-1, 1)),
          mood: clamp5(base + randInt(-1, 1)),
          social: clamp5(base + randInt(-1, 1)),
          communication: clamp5(base + randInt(-1, 1)),
          sleep: clamp5(base + randInt(-1, 1)),
          feeding: clamp5(base + randInt(-1, 1)),
        });
      }

      // ~60% das crianças com trilha em andamento
      if (rng() < 0.6 && tracks.length > 0) {
        enrollmentRows.push({
          childId: child.id,
          trackId: tracks[Math.floor(rng() * tracks.length)],
          status: "IN_PROGRESS",
          progress: randInt(10, 90),
          startedAt: daysAgo(randInt(10, 100)),
        });
      }
    }

    await prisma.evolutionRecord.createMany({ data: recordRows });
    if (enrollmentRows.length > 0)
      await prisma.trackEnrollment.createMany({ data: enrollmentRows, skipDuplicates: true });

    // Conteúdos consumidos (peso decrescente → variedade no "mais acessados")
    if (contents.length > 0) {
      const viewRows: { contentId: string; organizationId: string; childId: string; viewedAt: Date }[] = [];
      contents.forEach((c, idx) => {
        const views = randInt(40, 120) - idx * 15;
        for (let v = 0; v < Math.max(10, views); v++) {
          viewRows.push({
            contentId: c.id,
            organizationId: org.id,
            childId: cohortChildIds[Math.floor(rng() * cohortChildIds.length)],
            viewedAt: daysAgo(randInt(0, 60)),
          });
        }
      });
      await prisma.contentView.createMany({ data: viewRows });
    }

    // Emissões de relatório (histórico para o card)
    await prisma.reportEmission.createMany({
      data: Array.from({ length: 14 }, () => ({
        organizationId: org.id,
        kind: (rng() < 0.3 ? "MUNICIPAL" : "CHILD") as "MUNICIPAL" | "CHILD",
        emittedAt: daysAgo(randInt(0, 75)),
      })),
    });

    console.log(`   + Coorte municipal: 50 crianças, 50 responsáveis, 8 profissionais, ${recordRows.length} registros.`);
  }

  // --- Demonstração comercial (organização isolada "demo") ---
  await seedDemo(prisma, passwordHash);

  console.log("✅ Seed concluído.");
  console.log("   Login de teste (senha: senha123):");
  usersData.forEach((u) => console.log(`   - ${u.role.padEnd(12)} ${u.email}`));
  console.log("   Demonstração: admin-demo@ / prefeitura-demo@ / familia-demo@desenvolvatea.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
