import type {
  DevelopmentDomain,
  ContentType,
  EnrollmentStatus,
  EvolutionCategory,
} from "@/generated/prisma/enums";

export const DOMAIN_LABELS: Record<DevelopmentDomain, string> = {
  COMMUNICATION: "Comunicação",
  SOCIAL: "Social",
  MOTOR: "Motor",
  COGNITIVE: "Cognitivo",
  BEHAVIORAL: "Comportamental",
  AUTONOMY: "Autonomia",
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  ARTICLE: "Artigo",
  VIDEO: "Vídeo",
  ACTIVITY: "Atividade",
  GUIDE: "Guia",
};

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  NOT_STARTED: "Não iniciada",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
};

export const EVOLUTION_CATEGORY_LABELS: Record<EvolutionCategory, string> = {
  GENERAL: "Geral",
  THERAPY: "Terapia",
  HOME: "Casa",
  SCHOOL: "Escola",
  ROUTINE: "Rotina",
};

export const EVOLUTION_CATEGORIES: EvolutionCategory[] = [
  "GENERAL",
  "THERAPY",
  "HOME",
  "SCHOOL",
  "ROUTINE",
];

/** Humor da criança em escala 1–5, com emoji e rótulo. */
export const MOOD_SCALE: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😣", label: "Muito difícil" },
  { value: 2, emoji: "😟", label: "Difícil" },
  { value: 3, emoji: "😐", label: "Neutro" },
  { value: 4, emoji: "🙂", label: "Bem" },
  { value: 5, emoji: "😄", label: "Muito bem" },
];

/** Campos 1–5 do registro (além do humor), com rótulo curto. */
export const RATING_FIELDS = [
  { name: "performance", label: "Nível de desempenho" },
  { name: "communication", label: "Comunicação" },
  { name: "social", label: "Interação social" },
  { name: "sleep", label: "Sono" },
  { name: "feeding", label: "Alimentação" },
] as const;
