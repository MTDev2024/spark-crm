"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { addProspect, updateProspect } from "@/lib/store/crm-store";
import { parseForm, type FieldErrors } from "@/lib/validation/form";
import { prospectFormSchema } from "@/lib/validation/prospect";
import type { Prospect } from "@/types/domain";

/**
 * Formulaire de création ET de modification d'un prospect.
 * - Sans `prospect` : création. Avec `prospect` : modification (champs préremplis).
 * - Validation avec Zod ; les erreurs s'affichent sous chaque champ.
 * - Seul le nom de l'entreprise est obligatoire : on peut enregistrer une fiche
 *   très incomplète et la compléter plus tard.
 */
export function ProspectForm({ prospect }: { prospect?: Prospect }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseForm(prospectFormSchema, new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    if (prospect) {
      updateProspect(prospect.id, result.data);
      router.push(`/prospects/${prospect.id}`);
    } else {
      const created = addProspect(result.data);
      router.push(`/prospects/${created.id}`);
    }
  }

  // Raccourci : propriétés communes d'un champ texte.
  const text = (name: keyof typeof prospectFormSchema.shape) => ({
    id: name,
    name,
    defaultValue: prospect?.[name as keyof Prospect] ?? "",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Entreprise" name="company" error={errors.company} required>
            <Input {...text("company")} autoFocus />
          </Field>
        </div>
        <Field label="Contact" name="contactName" error={errors.contactName}>
          <Input {...text("contactName")} />
        </Field>
        <Field label="Fonction" name="contactRole" error={errors.contactRole}>
          <Input {...text("contactRole")} />
        </Field>
        <Field label="Activité" name="activity" error={errors.activity}>
          <Input {...text("activity")} />
        </Field>
        <Field label="Catégorie" name="category" error={errors.category}>
          <Input {...text("category")} />
        </Field>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Téléphone"
          name="phone"
          error={errors.phone}
          hint="Nécessaire pour préparer un appel"
        >
          <Input {...text("phone")} type="tel" />
        </Field>
        <Field
          label="Email"
          name="email"
          error={errors.email}
          hint="Nécessaire pour préparer un email"
        >
          <Input {...text("email")} type="email" />
        </Field>
        <Field
          label="Adresse"
          name="address"
          error={errors.address}
          hint="Nécessaire pour préparer une visite"
        >
          <Input {...text("address")} />
        </Field>
        <Field label="Ville" name="city" error={errors.city}>
          <Input {...text("city")} />
        </Field>
      </section>

      <div className="flex gap-2">
        <Button type="submit">
          {prospect ? "Enregistrer" : "Créer le prospect"}
        </Button>
        <Link
          href={prospect ? `/prospects/${prospect.id}` : "/prospects"}
          className={buttonVariants({ variant: "outline" })}
        >
          Annuler
        </Link>
      </div>
    </form>
  );
}
