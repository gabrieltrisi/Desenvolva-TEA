// Seed de demonstração comercial — organização "demo" isolada (multi-tenant).
// 100 crianças, 15 profissionais, 500 registros, 1000 conteúdos consumidos.
import type { PrismaClient } from "../src/generated/prisma/client";
import { recomputeChildMetrics } from "../src/lib/evolution/metrics";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const nextWeekday = (weekday: number, hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
};

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Miguel", "Sophia", "Arthur", "Helena", "Bernardo", "Valentina", "Heitor",
  "Laura", "Davi", "Isabella", "Lorenzo", "Manuela", "Théo", "Júlia", "Pedro",
  "Alice", "Gabriel", "Luiza", "Benjamin", "Cecília", "Matheus", "Lara", "Rafael",
  "Maria", "Enzo", "Lívia", "Nicolas", "Beatriz", "Gustavo", "Antonella", "Vitor",
  "Mariana", "Lucas", "Olívia", "Felipe", "Sarah", "Caio", "Eloá", "Daniel", "Yasmin",
];
const LAST = [
  "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Almeida",
  "Nascimento", "Araújo", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha",
  "Barbosa", "Alves", "Mendes", "Cardoso", "Teixeira", "Moraes", "Freitas",
  "Correia", "Pinto", "Monteiro",
];
const PARENTS = [
  "Ana", "Carlos", "Patrícia", "Marcos", "Fernanda", "Roberto", "Juliana",
  "Paulo", "Camila", "Rodrigo", "Aline", "Bruno", "Sandra", "Felipe", "Renata",
  "Diego", "Vanessa", "Thiago", "Priscila", "Eduardo",
];
const THERAPISTS = [
  "Dra. Carla Mendes", "Dr. João Lima", "Dra. Beatriz Souza", "Dr. André Costa",
  "Dra. Marina Alves", "Dr. Rafael Pinto", "Dra. Letícia Rocha", "Dr. Bruno Dias",
  "Dra. Camila Nunes", "Dr. Felipe Ramos", "Dra. Paula Castro", "Dr. Tiago Moreira",
  "Dra. Sofia Barros", "Dr. Henrique Lopes", "Dra. Larissa Pires",
];
const COLORS = ["#1cab88", "#5b8def", "#f97f3a", "#9b5bef", "#ef5b8d", "#3ac7b8"];
const CATS = ["THERAPY", "HOME", "SCHOOL", "ROUTINE", "GENERAL"] as const;

export async function seedDemo(prisma: PrismaClient, passwordHash: string) {
  const existing = await prisma.organization.findUnique({ where: { slug: "demo" } });
  if (existing) {
    console.log("   Demo premium já existe — pulando.");
    return;
  }

  const rng = makeRng(20260603);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rng() * arr.length)];
  const randInt = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
  const clamp5 = (n: number) => Math.max(1, Math.min(5, n));

  const org = await prisma.organization.create({
    data: { name: "Prefeitura de São Bento (Demonstração)", slug: "demo" },
  });

  // --- Usuários de demonstração ---
  await prisma.user.createMany({
    data: [
      { name: "Admin Demonstração", email: "admin-demo@desenvolvatea.com", role: "ADMIN", passwordHash, organizationId: org.id },
      { name: "Secretaria de Educação (Demo)", email: "prefeitura-demo@desenvolvatea.com", role: "PREFEITURA", passwordHash, organizationId: org.id },
      { name: "Família Demonstração", email: "familia-demo@desenvolvatea.com", role: "FAMILIA", passwordHash, organizationId: org.id },
    ],
  });
  const familiaDemo = (await prisma.user.findUnique({
    where: { email: "familia-demo@desenvolvatea.com" },
    select: { id: true },
  }))!;

  // --- 15 profissionais ---
  await prisma.user.createMany({
    data: THERAPISTS.map((name, i) => ({
      name,
      email: `prof-demo${i + 1}@desenvolvatea.com`,
      role: "PROFISSIONAL" as const,
      passwordHash,
      organizationId: org.id,
    })),
  });
  const profs = await prisma.user.findMany({
    where: { organizationId: org.id, role: "PROFISSIONAL" },
    select: { id: true },
    orderBy: { email: "asc" },
  });

  // --- Trilhas + conteúdos ---
  const trackDefs = [
    { title: "Primeiras Palavras", description: "Ampliar vocabulário e comunicação funcional.", domain: "COMMUNICATION" as const, coverColor: "#34c7a0", order: 1 },
    { title: "Brincar Junto", description: "Interação e habilidades sociais.", domain: "SOCIAL" as const, coverColor: "#5b8def", order: 2 },
    { title: "Rotina e Autonomia", description: "Rotinas e independência no dia a dia.", domain: "AUTONOMY" as const, coverColor: "#f97f3a", order: 3 },
  ];
  for (const t of trackDefs) {
    await prisma.learningTrack.create({
      data: { ...t, organizationId: org.id, modules: { create: [{ title: "Módulo 1", order: 1 }, { title: "Módulo 2", order: 2 }] } },
    });
  }
  const tracks = await prisma.learningTrack.findMany({ where: { organizationId: org.id }, select: { id: true } });

  const contentDefs = [
    { title: "Comunicação Alternativa (CAA): guia inicial", summary: "Sistemas de comunicação por imagens.", type: "GUIDE" as const, tags: ["comunicação", "caa"] },
    { title: "Rotinas visuais em casa", summary: "Montando quadros de rotina.", type: "ARTICLE" as const, tags: ["rotina"] },
    { title: "Brincadeiras sensoriais", summary: "Atividades de regulação sensorial.", type: "ACTIVITY" as const, tags: ["sensorial"] },
    { title: "Manejo de crises", summary: "Estratégias para momentos de desregulação.", type: "GUIDE" as const, tags: ["crise"] },
    { title: "Estimulando a fala", summary: "Exercícios práticos de linguagem.", type: "VIDEO" as const, tags: ["fala"] },
    { title: "Inclusão escolar", summary: "Apoio à adaptação na escola.", type: "ARTICLE" as const, tags: ["escola"] },
    { title: "Alimentação seletiva", summary: "Lidando com seletividade alimentar.", type: "GUIDE" as const, tags: ["alimentação"] },
    { title: "Sono e regulação", summary: "Higiene do sono na infância.", type: "ARTICLE" as const, tags: ["sono"] },
  ];
  await prisma.content.createMany({ data: contentDefs.map((c) => ({ ...c, organizationId: org.id })) });
  const contents = await prisma.content.findMany({ where: { organizationId: org.id }, select: { id: true } });

  // --- 100 responsáveis ---
  await prisma.user.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      name: `${pick(PARENTS)} ${LAST[(i * 3) % LAST.length]}`,
      email: `resp-demo${i + 1}@desenvolvatea.com`,
      role: "FAMILIA" as const,
      passwordHash,
      organizationId: org.id,
    })),
  });
  const guardians = await prisma.user.findMany({
    where: { organizationId: org.id, email: { startsWith: "resp-demo" } },
    select: { id: true },
    orderBy: { email: "asc" },
  });

  // --- 100 crianças + 500 registros (5 cada) ---
  const levelWeights = [1, 1, 2, 2, 2, 3, null];
  const childIds: string[] = [];
  const recordRows: {
    childId: string; authorId: string; date: Date; category: (typeof CATS)[number];
    performance: number; mood: number; social: number; communication: number; sleep: number; feeding: number;
  }[] = [];
  const enrollmentRows: { childId: string; trackId: string; status: "IN_PROGRESS"; progress: number; startedAt: Date }[] = [];

  for (let i = 0; i < 100; i++) {
    const overall = randInt(40, 95);
    const therapistId = profs[i % profs.length].id;
    const supportLevel = levelWeights[Math.floor(rng() * levelWeights.length)];
    const showcase = i < 2; // duas crianças da familia-demo

    const child = await prisma.child.create({
      data: {
        name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
        birthDate: daysAgo(randInt(3, 14) * 365 + randInt(0, 300)),
        supportLevel,
        avatarColor: pick(COLORS),
        accompaniedSince: daysAgo(randInt(120, 1000)),
        overallEvolution: overall,
        organizationId: org.id,
        therapistId,
        guardians: {
          connect: showcase
            ? [{ id: guardians[i].id }, { id: familiaDemo.id }]
            : [{ id: guardians[i].id }],
        },
      },
    });
    childIds.push(child.id);

    const base = clamp5(Math.round(overall / 20));
    for (let r = 0; r < 5; r++) {
      recordRows.push({
        childId: child.id,
        authorId: therapistId,
        date: daysAgo(randInt(0, 90)),
        category: pick(CATS),
        performance: clamp5(base + randInt(-1, 1)),
        mood: clamp5(base + randInt(-1, 1)),
        social: clamp5(base + randInt(-1, 1)),
        communication: clamp5(base + randInt(-1, 1)),
        sleep: clamp5(base + randInt(-1, 1)),
        feeding: clamp5(base + randInt(-1, 1)),
      });
    }

    if (rng() < 0.6) {
      enrollmentRows.push({
        childId: child.id,
        trackId: tracks[Math.floor(rng() * tracks.length)].id,
        status: "IN_PROGRESS",
        progress: randInt(10, 95),
        startedAt: daysAgo(randInt(10, 120)),
      });
    }
  }

  await prisma.evolutionRecord.createMany({ data: recordRows }); // 500
  if (enrollmentRows.length) await prisma.trackEnrollment.createMany({ data: enrollmentRows, skipDuplicates: true });

  // --- 1000 conteúdos consumidos ---
  await prisma.contentView.createMany({
    data: Array.from({ length: 1000 }, () => ({
      contentId: pick(contents).id,
      organizationId: org.id,
      childId: childIds[Math.floor(rng() * childIds.length)],
      viewedAt: daysAgo(randInt(0, 90)),
    })),
  });

  // --- Emissões de relatório (histórico) ---
  await prisma.reportEmission.createMany({
    data: Array.from({ length: 30 }, () => ({
      organizationId: org.id,
      kind: (rng() < 0.35 ? "MUNICIPAL" : "CHILD") as "MUNICIPAL" | "CHILD",
      emittedAt: daysAgo(randInt(0, 90)),
    })),
  });

  // --- Vitrine da família: enriquece a 1ª criança da familia-demo ---
  const showcaseChild = childIds[0];
  await prisma.therapySession.createMany({
    data: [
      ...Array.from({ length: 24 }, (_, i) => ({ childId: showcaseChild, scheduledAt: daysAgo((24 - i) * 7), status: "COMPLETED" as const })),
      { childId: showcaseChild, scheduledAt: nextWeekday(4, 14), status: "SCHEDULED" as const, notes: "Sessão semanal" },
    ],
  });
  await prisma.achievement.createMany({
    data: ["Primeira palavra nova", "Rotina da manhã", "Contato visual", "Brincadeira em dupla", "Noite tranquila", "Sem crises na semana", "Atividade concluída", "7 dias seguidos", "Novo jogo", "Leitura compartilhada", "Autonomia no lanche", "100 XP"].map((title, i) => ({
      childId: showcaseChild, title, icon: "★", earnedAt: daysAgo(i * 5),
    })),
  });
  await prisma.xpEvent.createMany({
    data: [
      { childId: showcaseChild, amount: 20, reason: "Sessão concluída", createdAt: daysAgo(1) },
      { childId: showcaseChild, amount: 18, reason: "Atividade do dia", createdAt: daysAgo(2) },
      { childId: showcaseChild, amount: 16, reason: "Rotina cumprida", createdAt: daysAgo(3) },
      { childId: showcaseChild, amount: 18, reason: "Conquista", createdAt: daysAgo(4) },
    ],
  });
  const wk = [70, 74, 62, 84, 72, 90, 94];
  const mo = [64, 72, 78, 82];
  const yr = [42, 48, 53, 57, 60, 64, 67, 70, 73, 76, 79, 82];
  await prisma.evolutionPoint.createMany({
    data: [
      ...["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((label, i) => ({ childId: showcaseChild, period: "WEEK" as const, order: i, label, value: wk[i] })),
      ...["S1", "S2", "S3", "S4"].map((label, i) => ({ childId: showcaseChild, period: "MONTH" as const, order: i, label, value: mo[i] })),
      ...["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((label, i) => ({ childId: showcaseChild, period: "YEAR" as const, order: i, label, value: yr[i] })),
    ],
  });
  await recomputeChildMetrics(prisma, showcaseChild);
  await recomputeChildMetrics(prisma, childIds[1]);

  console.log("   + Demo premium (org 'demo'): 100 crianças, 15 profissionais, 500 registros, 1000 conteúdos.");
}
