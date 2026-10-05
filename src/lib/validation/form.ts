import { z } from "zod";

/**
 * Outils communs aux schémas de formulaires.
 * Un formulaire HTML renvoie toujours des chaînes : un champ laissé vide vaut "".
 * On le convertit en `null` pour respecter la règle « inconnu = null ».
 */

/** Texte optionnel : "  " ou "" devient null. */
export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value));

/** Email optionnel : vide accepté (→ null), sinon doit être un email valide. */
export const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || z.email().safeParse(value).success, {
    message: "Adresse email invalide",
  })
  .transform((value) => (value === "" ? null : value));

/** Date optionnelle au format YYYY-MM-DD (valeur d'un <input type="date">). */
export const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Date invalide",
  })
  .transform((value) => (value === "" ? null : value));

/** Date obligatoire au format YYYY-MM-DD. */
export const requiredDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date obligatoire");

/** Convertit un FormData en objet simple { champ: valeur } pour Zod. */
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

/** Erreurs par champ : { company: "Champ obligatoire" }. Première erreur de chaque champ. */
export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (!(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

/** Résultat d'une validation de formulaire. */
export type FormResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

/** Valide un FormData avec un schéma et renvoie soit les données propres, soit les erreurs par champ. */
export function parseForm<T>(
  schema: z.ZodType<T>,
  formData: FormData,
): FormResult<T> {
  const parsed = schema.safeParse(formDataToObject(formData));
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, errors: toFieldErrors(parsed.error) };
}
