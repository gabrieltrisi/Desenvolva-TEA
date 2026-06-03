import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes condicionais resolvendo conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Calcula a idade (em anos) a partir de uma data de nascimento. */
export function calcAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Iniciais para avatar (ex.: "Ana Lima" -> "AL"). */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Data/hora atual (encapsulado para uso em Server Components). */
export function currentDate(): Date {
  return new Date();
}

/** Data de N dias atrás. */
export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}

/** Quantidade inteira de anos decorridos desde uma data. */
export function yearsSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (365.25 * DAY_MS));
}
