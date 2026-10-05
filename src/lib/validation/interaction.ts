import { z } from "zod";
import { actionTypeSchema, prioritySchema } from "./action";
import { optionalDate, optionalText, requiredDate } from "./form";

export const channelSchema = z.enum([
  "phone",
  "visit",
  "email",
  "message",
  "meeting",
]);

/**
 * Formulaire d'interaction. Règle produit : toute interaction doit déboucher
 * sur une prochaine action OU sur un choix explicite « aucune ».
 * `nextChoice` n'a donc pas de valeur par défaut : l'utilisateur doit trancher.
 */
export const interactionFormSchema = z
  .object({
    occurredAt: requiredDate,
    channel: channelSchema,
    objective: optionalText,
    outcome: optionalText,
    notes: optionalText,
    nextChoice: z.enum(["action", "none"], {
      error: "Choisissez une prochaine action ou « aucune »",
    }),
    // Champs de la prochaine action : lus seulement si nextChoice === "action".
    actionType: actionTypeSchema.default("call"),
    actionObjective: optionalText,
    actionDueAt: optionalDate,
    actionPriority: prioritySchema.default("normal"),
  })
  .refine(
    (data) => data.nextChoice !== "action" || data.actionObjective !== null,
    {
      path: ["actionObjective"],
      message: "Décrivez l'objectif de la prochaine action",
    },
  );

export type InteractionFormData = z.infer<typeof interactionFormSchema>;
