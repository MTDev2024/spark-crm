"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { NativeSelect, toOptions } from "@/components/shared/native-select";
import {
  actionTypeLabels,
  channelLabels,
  priorityLabels,
} from "@/config/labels";
import { toDateString } from "@/lib/domain/actions";
import { addInteraction } from "@/lib/store/crm-store";
import { parseForm, type FieldErrors } from "@/lib/validation/form";
import { interactionFormSchema } from "@/lib/validation/interaction";

/**
 * Formulaire « Ajouter une interaction » (appel, visite, email…).
 *
 * Règle produit centrale : une interaction doit déboucher sur une prochaine
 * action OU sur « aucune » choisi explicitement. Aucun des deux boutons radio
 * n'est présélectionné, donc impossible d'oublier la suite.
 */
export function InteractionForm({
  prospectId,
  onDone,
}: {
  prospectId: string;
  onDone: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  // Les champs de la prochaine action n'apparaissent que si on choisit « action ».
  const [nextChoice, setNextChoice] = useState<"action" | "none" | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseForm(interactionFormSchema, new FormData(event.currentTarget));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const d = result.data;
    addInteraction(
      {
        prospectId,
        occurredAt: d.occurredAt,
        channel: d.channel,
        objective: d.objective,
        outcome: d.outcome,
        notes: d.notes,
      },
      d.nextChoice === "action" && d.actionObjective
        ? {
            type: d.actionType,
            objective: d.actionObjective,
            reason: null,
            dueAt: d.actionDueAt,
            priority: d.actionPriority,
          }
        : null,
    );
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2"
    >
      <Field label="Canal" name="channel">
        <NativeSelect name="channel" defaultValue="phone" options={toOptions(channelLabels)} />
      </Field>
      <Field label="Date" name="occurredAt" error={errors.occurredAt} required>
        <Input id="occurredAt" name="occurredAt" type="date" defaultValue={toDateString(new Date())} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Objectif du contact" name="objective">
          <Input id="objective" name="objective" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Résultat" name="outcome" hint="Ce qui s'est passé, en une phrase">
          <Input id="outcome" name="outcome" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Notes / débrief"
          name="notes"
          hint="Besoins, objections, signaux, engagements pris…"
        >
          <Textarea id="notes" name="notes" rows={4} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2 sm:col-span-2">
        <legend className="text-sm font-medium">Prochaine étape *</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="nextChoice"
            value="action"
            onChange={() => setNextChoice("action")}
          />
          Planifier une prochaine action
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="nextChoice"
            value="none"
            onChange={() => setNextChoice("none")}
          />
          Aucune prochaine action
        </label>
        {errors.nextChoice ? (
          <p role="alert" className="text-xs text-destructive">
            {errors.nextChoice}
          </p>
        ) : null}
      </fieldset>

      {nextChoice === "action" ? (
        <div className="grid gap-4 rounded-md border bg-background p-3 sm:col-span-2 sm:grid-cols-2">
          <Field label="Type d'action" name="actionType">
            <NativeSelect name="actionType" defaultValue="call" options={toOptions(actionTypeLabels)} />
          </Field>
          <Field label="Échéance" name="actionDueAt" error={errors.actionDueAt}>
            <Input id="actionDueAt" name="actionDueAt" type="date" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Objectif" name="actionObjective" error={errors.actionObjective} required>
              <Input id="actionObjective" name="actionObjective" />
            </Field>
          </div>
          <Field label="Priorité" name="actionPriority">
            <NativeSelect name="actionPriority" defaultValue="normal" options={toOptions(priorityLabels)} />
          </Field>
        </div>
      ) : null}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit">Enregistrer l&apos;interaction</Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
