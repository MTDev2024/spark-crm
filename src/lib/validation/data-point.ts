import { z } from "zod";
import { optionalDate, optionalText } from "./form";

/**
 * Formulaire « Ajouter une donnée » sur un prospect.
 * Règle « ne pas inventer » : une donnée confirmée ou à vérifier doit avoir
 * une valeur ; les statuts manquant / introuvable / non applicable n'en ont pas.
 */
export const dataPointFormSchema = z
  .object({
    key: z.string().trim().min(1, "Le libellé est obligatoire"),
    value: optionalText,
    kind: z.enum(["fact", "signal", "hypothesis"]),
    status: z.enum([
      "confirmed",
      "to_verify",
      "missing",
      "searched_not_found",
      "not_applicable",
    ]),
    source: optionalText,
    collectedAt: optionalDate,
  })
  .refine(
    (data) =>
      data.value !== null ||
      !["confirmed", "to_verify"].includes(data.status),
    {
      path: ["value"],
      message: "Une valeur est requise pour une donnée confirmée ou à vérifier",
    },
  );

export type DataPointFormData = z.infer<typeof dataPointFormSchema>;
