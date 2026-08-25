import { z } from "zod";

const score = z.coerce
  .number({ message: "Selecione um valor de 1 a 5." })
  .int()
  .min(1, "Mínimo 1.")
  .max(5, "Máximo 5.");

export const evolutionRecordSchema = z.object({
  childId: z.string().min(1, "Selecione a criança."),
  date: z.coerce.date({ message: "Data inválida." }),
  category: z.enum(["GENERAL", "THERAPY", "HOME", "SCHOOL", "ROUTINE"]),
  note: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(1000, "Máximo de 1000 caracteres.").optional(),
  ),
  performance: score,
  mood: score,
  social: score,
  communication: score,
  sleep: score,
  feeding: score,
});

export type EvolutionRecordInput = z.infer<typeof evolutionRecordSchema>;
