import {
  MessageCircle,
  Smile,
  Moon,
  AlertTriangle,
  Brain,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { MetricKey } from "@/generated/prisma/enums";

export interface MetricMeta {
  label: string;
  icon: LucideIcon;
  color: string; // cor da barra/realce
  /** Quando true, queda na métrica é positiva (ex.: frequência de crises). */
  lowerIsBetter?: boolean;
}

export const METRIC_META: Record<MetricKey, MetricMeta> = {
  COMMUNICATION: { label: "Comunicação", icon: MessageCircle, color: "#3a6fe0" },
  SOCIAL_INTERACTION: { label: "Interação Social", icon: Smile, color: "#1cab88" },
  SLEEP_QUALITY: { label: "Qualidade do Sono", icon: Moon, color: "#9b5bef" },
  CRISIS_FREQUENCY: {
    label: "Frequência de Crises",
    icon: AlertTriangle,
    color: "#f97f3a",
    lowerIsBetter: true,
  },
  COGNITIVE: { label: "Dev. Cognitivo", icon: Brain, color: "#f0a73a" },
  DAILY_ROUTINE: { label: "Rotina Diária", icon: ClipboardList, color: "#22b07d" },
};

/** Ordem de exibição dos cards (igual ao mockup). */
export const METRIC_ORDER: MetricKey[] = [
  "COMMUNICATION",
  "SOCIAL_INTERACTION",
  "SLEEP_QUALITY",
  "CRISIS_FREQUENCY",
  "COGNITIVE",
  "DAILY_ROUTINE",
];
