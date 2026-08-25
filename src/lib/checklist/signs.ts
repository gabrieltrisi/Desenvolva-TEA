/**
 * Dados e lógica PUROS do checklist de sinais (Fase 2). Sem estado, sem I/O,
 * sem persistência — pode ser importado tanto no client quanto no server.
 *
 * ⚠️ Ferramenta informativa. NÃO é diagnóstico e não substitui avaliação
 * médica, psicológica ou terapêutica.
 */

export type Weight = "baixa" | "media" | "alta";

export const WEIGHT_LABEL: Record<Weight, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export type CategoryKey =
  | "comunicacao"
  | "social"
  | "repetitivo"
  | "sensorial"
  | "alimentacao"
  | "sono"
  | "motor";

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { key: "comunicacao", label: "Comunicação e fala", emoji: "🗣️" },
  { key: "social", label: "Socialização", emoji: "👥" },
  { key: "repetitivo", label: "Comportamentos repetitivos", emoji: "🔄" },
  { key: "sensorial", label: "Sensorial", emoji: "🌀" },
  { key: "alimentacao", label: "Alimentação", emoji: "🍽️" },
  { key: "sono", label: "Sono", emoji: "😴" },
  { key: "motor", label: "Desenvolvimento motor", emoji: "🏃" },
];

export interface Sign {
  id: string;
  category: CategoryKey;
  label: string;
  hint: string;
  weight: Weight;
  /** Marca regressão/perda de habilidades — eleva a prioridade do resultado. */
  regression?: boolean;
}

export const SIGNS: Sign[] = [
  // Comunicação e fala
  { id: "com-contato-visual", category: "comunicacao", label: "Evita contato visual com frequência", hint: "Raramente olha nos olhos, mesmo de pessoas próximas.", weight: "alta" },
  { id: "com-nome", category: "comunicacao", label: "Não responde quando chamada pelo nome", hint: "Parece não ouvir, mas a audição é normal.", weight: "media" },
  { id: "com-fala", category: "comunicacao", label: "Apresenta atraso na fala ou não fala", hint: "Poucas ou nenhuma palavra na idade esperada.", weight: "alta" },
  { id: "com-aponta", category: "comunicacao", label: "Não aponta para mostrar interesse", hint: "Não usa o gesto de apontar para compartilhar algo.", weight: "alta" },
  { id: "com-ecolalia", category: "comunicacao", label: "Repete palavras ou frases fora de contexto", hint: "Ecolalia — repete falas de TV, músicas ou conversas.", weight: "media" },

  // Socialização
  { id: "soc-brincar", category: "social", label: "Tem dificuldade em brincar com outras crianças", hint: "Pouco interesse ou dificuldade de interação.", weight: "media" },
  { id: "soc-compartilha", category: "social", label: "Não compartilha interesse ou alegria", hint: "Não mostra brinquedos ou conquistas para os pais.", weight: "alta" },
  { id: "soc-sozinha", category: "social", label: "Prefere ficar sozinha quase sempre", hint: "Pouco interesse por outras pessoas.", weight: "baixa" },
  { id: "soc-faz-conta", category: "social", label: "Não brinca de faz-de-conta", hint: "Ausência de brincadeira simbólica na idade esperada.", weight: "media" },

  // Comportamentos repetitivos
  { id: "rep-movimentos", category: "repetitivo", label: "Repete movimentos ou sons", hint: "Balança o corpo, bate as mãos, repete sons (stimming).", weight: "media" },
  { id: "rep-rotina", category: "repetitivo", label: "Reage muito mal a mudanças de rotina", hint: "Crises intensas quando algo muda no dia a dia.", weight: "alta" },
  { id: "rep-interesse", category: "repetitivo", label: "Interesse fixo e muito intenso em um assunto", hint: "Foco excessivo em um único tema ou objeto.", weight: "baixa" },
  { id: "rep-alinhar", category: "repetitivo", label: "Alinha ou organiza objetos repetidamente", hint: "Enfileira brinquedos em vez de brincar com eles.", weight: "baixa" },

  // Sensorial
  { id: "sen-crises", category: "sensorial", label: "Tem crises com barulhos, luzes ou texturas", hint: "Tapa os ouvidos, evita ambientes, não tolera certas roupas.", weight: "media" },
  { id: "sen-dor", category: "sensorial", label: "Não reage à dor como o esperado", hint: "Parece não sentir dor ou reage de forma exagerada.", weight: "media" },
  { id: "sen-busca", category: "sensorial", label: "Busca estímulos sensoriais incomuns", hint: "Gira, cheira objetos, observa luzes por muito tempo.", weight: "baixa" },

  // Alimentação
  { id: "ali-seletividade", category: "alimentacao", label: "Tem seletividade alimentar intensa", hint: "Aceita pouquíssimos alimentos, por textura ou cor.", weight: "media" },

  // Sono
  { id: "son-dificuldade", category: "sono", label: "Tem dificuldade persistente para dormir", hint: "Demora muito para dormir ou acorda repetidas vezes.", weight: "baixa" },

  // Desenvolvimento motor
  { id: "mot-ponta-pes", category: "motor", label: "Anda na ponta dos pés com frequência", hint: "Padrão de marcha repetido sem causa física.", weight: "baixa" },
  { id: "mot-atraso", category: "motor", label: "Apresentou atraso motor (sentar, engatinhar, andar)", hint: "Marcos motores alcançados mais tarde que o esperado.", weight: "media" },

  // Regressão (eleva a prioridade)
  { id: "reg-perda", category: "comunicacao", label: "Perdeu habilidades que já tinha", hint: "Regressão de fala, contato ou interação já adquiridos.", weight: "alta", regression: true },
];

export type ResultLevel = "leve" | "atencao" | "alta";

export interface CategoryCount {
  key: CategoryKey;
  label: string;
  emoji: string;
  count: number;
}

export interface ChecklistResult {
  level: ResultLevel;
  total: number;
  alta: number;
  media: number;
  baixa: number;
  regression: boolean;
  byCategory: CategoryCount[];
}

/**
 * Classifica o conjunto de sinais marcados. Regras:
 *  - Alta prioridade: ≥2 sinais de alta relevância, OU ≥6 sinais totais, OU regressão.
 *  - Atenção recomendada: ≥1 sinal de alta relevância, OU ≥4 sinais totais.
 *  - Leve atenção: abaixo disso.
 */
export function computeResult(selectedIds: string[]): ChecklistResult {
  const ids = new Set(selectedIds);
  const selected = SIGNS.filter((s) => ids.has(s.id));

  const alta = selected.filter((s) => s.weight === "alta").length;
  const media = selected.filter((s) => s.weight === "media").length;
  const baixa = selected.filter((s) => s.weight === "baixa").length;
  const regression = selected.some((s) => s.regression);
  const total = selected.length;

  let level: ResultLevel = "leve";
  if (alta >= 2 || total >= 6 || regression) level = "alta";
  else if (alta >= 1 || total >= 4) level = "atencao";

  const byCategory: CategoryCount[] = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    emoji: c.emoji,
    count: selected.filter((s) => s.category === c.key).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return { level, total, alta, media, baixa, regression, byCategory };
}

export interface ResultMeta {
  title: string;
  tagline: string;
  explanation: string;
  /** Tom para estilização (sem depender só de cor — sempre há rótulo/texto). */
  tone: "leve" | "atencao" | "alta";
  nextSteps: string[];
}

export const RESULT_META: Record<ResultLevel, ResultMeta> = {
  leve: {
    title: "Leve atenção",
    tagline: "Poucos ou nenhum sinal observado.",
    tone: "leve",
    explanation:
      "Com base no que você marcou, foram observados poucos sinais. Isso não descarta nem confirma nada — cada criança se desenvolve no seu ritmo. Continue observando e converse com o pediatra em consultas de rotina.",
    nextSteps: [
      "Observe e registre a rotina e o comportamento da criança ao longo das semanas.",
      "Leve suas observações ao pediatra na próxima consulta.",
      "Explore conteúdos sobre desenvolvimento infantil para se informar.",
    ],
  },
  atencao: {
    title: "Atenção recomendada",
    tagline: "Alguns sinais merecem acompanhamento.",
    tone: "atencao",
    explanation:
      "Você marcou sinais que merecem atenção. Isso não significa um diagnóstico, mas é um bom momento para registrar suas observações e conversar com um profissional de saúde sobre o desenvolvimento da criança.",
    nextSteps: [
      "Registre, com datas, os comportamentos que você observou.",
      "Converse com o pediatra e compartilhe suas observações.",
      "Considere uma avaliação com neuropediatra, psicólogo, fonoaudiólogo ou terapeuta ocupacional, conforme a orientação do pediatra.",
      "Use os conteúdos da plataforma para apoiar a rotina em casa.",
    ],
  },
  alta: {
    title: "Alta prioridade para avaliação",
    tagline: "Vários sinais relevantes foram observados.",
    tone: "alta",
    explanation:
      "Você marcou vários sinais relevantes (ou sinais de maior peso). Isso não é um diagnóstico, mas recomenda-se buscar uma avaliação profissional o quanto antes. A identificação precoce faz diferença no acompanhamento.",
    nextSteps: [
      "Procure o pediatra e relate os sinais observados o quanto antes.",
      "Busque avaliação com neuropediatra e equipe multidisciplinar (psicólogo, fono, TO).",
      "Registre a rotina e a evolução para apoiar a avaliação profissional.",
      "Conheça a plataforma para organizar o acompanhamento quando iniciar o cuidado.",
    ],
  },
};
