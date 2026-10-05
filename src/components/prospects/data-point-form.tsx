"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { NativeSelect, toOptions } from "@/components/shared/native-select";
import { dataStatusLabels, infoKindLabels } from "@/config/labels";
import { addDataPoint } from "@/lib/store/crm-store";
import { dataPointFormSchema } from "@/lib/validation/data-point";
import { parseForm, type FieldErrors } from "@/lib/validation/form";

/**
 * Formulaire « Ajouter une donnée » (site web, outil de réservation, réseau social…).
 * Le libellé est libre : pas de liste figée de champs, l'écosystème numérique
 * de chaque prospect est décrit comme on le souhaite.
 * Chaque donnée porte sa nature (fait / signal / hypothèse), son statut et sa source.
 */
export function DataPointForm({
  prospectId,
  onDone,
}: {
  prospectId: string;
  onDone: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseForm(dataPointFormSchema, new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    addDataPoint({ ...result.data, prospectId });
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2"
    >
      <Field label="Libellé" name="key" error={errors.key} required hint="Ex. Site web, Planity, Instagram…">
        <Input id="key" name="key" />
      </Field>
      <Field label="Valeur" name="value" error={errors.value} hint="Laisser vide si inconnue">
        <Input id="value" name="value" />
      </Field>
      <Field label="Nature" name="kind">
        <NativeSelect name="kind" defaultValue="fact" options={toOptions(infoKindLabels)} />
      </Field>
      <Field label="Statut" name="status">
        <NativeSelect name="status" defaultValue="confirmed" options={toOptions(dataStatusLabels)} />
      </Field>
      <Field label="Source" name="source" hint="D'où vient cette information ?">
        <Input id="source" name="source" />
      </Field>
      <Field label="Date de collecte" name="collectedAt" error={errors.collectedAt}>
        <Input id="collectedAt" name="collectedAt" type="date" />
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">Ajouter la donnée</Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
