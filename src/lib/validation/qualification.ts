import { z } from "zod";

export const knowDoSchema = z.enum(["savoir", "faire", "savoir_faire"]);

const statement = z.object({
  text: z.string().min(1),
  sourceId: z.string().nullable(),
});

/**
 * Schéma de sortie de la qualification. Faits, signaux et hypothèses restent
 * séparés ; un problème actif absent est une valeur valide (null).
 */
export const qualificationSchema = z.object({
  situation: z.string(),
  activeProblem: z.string().nullable(),
  facts: z.array(statement),
  signals: z.array(statement),
  hypotheses: z.array(statement),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  excludedOffers: z.array(z.string()),
  knowDo: knowDoSchema.nullable(),
  recommendedAngle: z.string().nullable(),
  objections: z.array(z.string()),
  recommendedChannel: z
    .enum(["phone", "visit", "email", "message", "meeting"])
    .nullable(),
  nextAction: z
    .object({
      type: z.string(),
      objective: z.string(),
      dueAt: z.string().nullable(),
    })
    .nullable(),
});

export type Qualification = z.infer<typeof qualificationSchema>;
