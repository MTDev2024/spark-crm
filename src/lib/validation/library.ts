import { z } from "zod";
import type { EntityConfig, FieldDef } from "@/config/library";
import { optionalDate, optionalText, requiredDate } from "./form";

/**
 * Construit le schéma Zod d'un type d'élément de la bibliothèque à partir de sa
 * description (src/config/library.ts). Un formulaire renvoie toujours des
 * chaînes : chaque schéma convertit la chaîne vers le bon type, et un champ
 * vide devient null (inconnu), jamais une valeur inventée.
 */

const emptyToNull = (value: string) => (value === "" ? null : value);

function fieldSchema(field: FieldDef): z.ZodType {
  switch (field.kind) {
    case "text":
    case "textarea":
      return field.required
        ? z.string().trim().min(1, "Champ obligatoire")
        : optionalText;

    case "url":
      return z
        .string()
        .trim()
        .refine((v) => v === "" || z.url().safeParse(v).success, "URL invalide")
        .transform(emptyToNull);

    case "date":
      return field.required ? requiredDate : optionalDate;

    case "number":
      return z
        .string()
        .trim()
        .refine((v) => (field.required ? /^\d+$/.test(v) : v === "" || /^\d+$/.test(v)), {
          message: "Nombre entier positif requis",
        })
        .transform((v) => (v === "" ? null : Number(v)));

    case "list":
      // Une valeur par ligne ; lignes vides ignorées ; champ absent = liste vide.
      return z
        .string()
        .optional()
        .transform((v) =>
          (v ?? "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line !== ""),
        );

    case "select": {
      const values = (field.options ?? []).map((o) => o.value);
      const allowed = (v: string) => values.includes(v);
      return z
        .string()
        .trim()
        .refine((v) => (field.required ? allowed(v) : v === "" || allowed(v)), {
          message: "Choix invalide",
        })
        .transform(emptyToNull);
    }

    case "relation":
      return z
        .string()
        .trim()
        .refine((v) => (field.required ? z.uuid().safeParse(v).success : v === "" || z.uuid().safeParse(v).success), {
          message: "Sélection invalide",
        })
        .transform(emptyToNull);
  }
}

export function buildEntitySchema(
  config: EntityConfig,
): z.ZodType<Record<string, unknown>> {
  const shape = Object.fromEntries(
    config.fields.map((field) => [field.name, fieldSchema(field)]),
  );
  return z.object(shape).superRefine((data, ctx) => {
    // Règle de connaissance : une méthode validée doit avoir une source (aussi imposé par la base).
    if (config.table === "sales_methods" && data.status === "validated" && !data.sourceId) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Une méthode validée doit avoir une source",
      });
    }
  }) as unknown as z.ZodType<Record<string, unknown>>;
}
