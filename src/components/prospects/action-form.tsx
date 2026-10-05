"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { NativeSelect, toOptions } from "@/components/shared/native-select";
import { actionTypeLabels, priorityLabels } from "@/config/labels";
import { addAction } from "@/lib/store/crm-store";
import { actionFormSchema } from "@/lib/validation/action";
import { parseForm, type FieldErrors } from "@/lib/validation/form";

/**
 * Formulaire « Ajouter une prochaine action » sur un prospect.
 * L'objectif est obligatoire : chaque action doit avoir une raison d'être.
 */
export function ActionForm({
  prospectId,
  onDone,
}: {
  prospectId: string;
  onDone: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseForm(actionFormSchema, new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    addAction({ ...result.data, prospectId });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2"
    >
      <Field label="Type" name="type">
        <NativeSelect name="type" defaultValue="call" options={toOptions(actionTypeLabels)} />
      </Field>
      <Field label="Échéance" name="dueAt" error={errors.dueAt}>
        <Input id="dueAt" name="dueAt" type="date" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Objectif" name="objective" error={errors.objective} required>
          <Input id="objective" name="objective" placeholder="Ex. Rappeler pour proposer un rendez-vous" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Raison / contexte" name="reason" hint="Pourquoi cette action maintenant ?">
          <Input id="reason" name="reason" />
        </Field>
      </div>
      <Field label="Priorité" name="priority">
        <NativeSelect name="priority" defaultValue="normal" options={toOptions(priorityLabels)} />
      </Field>
      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="submit">Ajouter l&apos;action</Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
