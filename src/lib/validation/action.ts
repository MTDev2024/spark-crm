import { z } from "zod";
import { optionalDate, optionalText } from "./form";

/** Valeurs autorisées, alignées sur les types de src/types/domain.ts. */
export const actionTypeSchema = z.enum([
  "call",
  "visit",
  "email",
  "message",
  "follow_up",
  "meeting",
  "qualify",
  "other",
]);

export const prioritySchema = z.enum(["low", "normal", "high"]);

/** Formulaire « Ajouter une prochaine action ». */
export const actionFormSchema = z.object({
  type: actionTypeSchema,
  objective: z.string().trim().min(1, "L'objectif de l'action est obligatoire"),
  reason: optionalText,
  dueAt: optionalDate,
  priority: prioritySchema,
});

export type ActionFormData = z.infer<typeof actionFormSchema>;
