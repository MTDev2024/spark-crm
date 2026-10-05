"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { NativeSelect } from "@/components/shared/native-select";
import type { EntityConfig, FieldDef } from "@/config/library";
import { addItem, updateItem, useLibrary } from "@/lib/store/library-store";
import { parseForm, type FieldErrors } from "@/lib/validation/form";
import { buildEntitySchema } from "@/lib/validation/library";
import type { LibraryItem } from "@/types/library";

/** Valeur affichée au départ dans un champ (modification, ou valeur par défaut à la création). */
function initialValue(field: FieldDef, item?: LibraryItem, defaults?: Record<string, string>): string {
  const current = item?.[field.name];
  if (Array.isArray(current)) return current.join("\n"); // liste : une valeur par ligne
  if (current !== undefined && current !== null) return String(current);
  if (item) return "";
  return defaults?.[field.name] ?? field.defaultValue ?? "";
}

/**
 * Formulaire généré à partir de la description d'un type d'élément
 * (src/config/library.ts) : même composant pour sources, méthodes, offres, etc.
 *
 * - `item` fourni : modification ; sinon création.
 * - `fixedValues` : valeurs imposées non saisies (ex. `methodId` pour une étape).
 * - `defaults` : valeurs initiales à la création (ex. prochain numéro d'étape).
 * La validation (Zod) est construite depuis la même description.
 */
export function EntityForm({
  config,
  item,
  fixedValues,
  defaults,
  onDone,
}: {
  config: EntityConfig;
  item?: LibraryItem;
  fixedValues?: Record<string, unknown>;
  defaults?: Record<string, string>;
  onDone: () => void;
}) {
  const { state } = useLibrary();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseForm(buildEntitySchema(config), new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    if (item) updateItem(config.table, item.id, result.data);
    else addItem(config.table, { ...result.data, ...fixedValues });
    onDone();
  }

  function control(field: FieldDef) {
    const value = initialValue(field, item, defaults);
    const common = {
      id: field.name,
      name: field.name,
      "aria-invalid": errors[field.name] ? true : undefined,
      "aria-describedby": errors[field.name] ? `${field.name}-error` : undefined,
    };

    switch (field.kind) {
      case "textarea":
        return <Textarea {...common} rows={3} defaultValue={value} />;
      case "list":
        return <Textarea {...common} rows={4} defaultValue={value} />;
      case "date":
        return <Input {...common} type="date" defaultValue={value} />;
      case "number":
        return <Input {...common} type="number" min={0} defaultValue={value} />;
      case "select": {
        const options = field.options ?? [];
        return (
          <NativeSelect
            name={field.name}
            defaultValue={value}
            options={field.required ? options : [{ value: "", label: "—" }, ...options]}
          />
        );
      }
      case "relation": {
        const target = field.relation!;
        const options = state[target.table].map((other) => ({
          value: other.id,
          label: String(other[target.labelField] ?? ""),
        }));
        return (
          <NativeSelect
            name={field.name}
            defaultValue={value}
            options={[{ value: "", label: "— Aucune —" }, ...options]}
          />
        );
      }
      default:
        return <Input {...common} defaultValue={value} />;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2"
    >
      {config.fields.map((field) => {
        // Les textes longs et les listes occupent toute la largeur.
        const wide = ["textarea", "list"].includes(field.kind) || field.name === config.titleField;
        return (
          <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
            <Field
              label={field.label}
              name={field.name}
              error={errors[field.name]}
              hint={field.hint}
              required={field.required}
            >
              {control(field)}
            </Field>
          </div>
        );
      })}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">{item ? "Enregistrer" : "Ajouter"}</Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
