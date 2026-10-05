import { z } from "zod";
import { optionalEmail, optionalText } from "./form";

/**
 * Formulaire prospect. Seul le nom de l'entreprise est obligatoire :
 * une fiche incomplète est valide et peut déjà être qualifiée.
 */
export const prospectFormSchema = z.object({
  company: z.string().trim().min(1, "Le nom de l'entreprise est obligatoire"),
  contactName: optionalText,
  contactRole: optionalText,
  activity: optionalText,
  category: optionalText,
  address: optionalText,
  city: optionalText,
  phone: optionalText,
  email: optionalEmail,
});

export type ProspectFormData = z.infer<typeof prospectFormSchema>;
