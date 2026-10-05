"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { methodStepConfig } from "@/config/library";
import { useLibrary } from "@/lib/store/library-store";
import { EntityForm } from "./entity-form";
import { ItemCard } from "./item-card";

/**
 * Étapes d'une méthode, affichées dans la carte de la méthode.
 * Triées par numéro d'ordre ; une étape se crée avec le numéro suivant par défaut.
 */
export function StepsPanel({ methodId }: { methodId: string }) {
  const { state } = useLibrary();
  const [adding, setAdding] = useState(false);

  const steps = state.sales_method_steps
    .filter((step) => step.methodId === methodId)
    .sort((a, b) => Number(a.position) - Number(b.position));
  const nextPosition = steps.length === 0 ? 1 : Number(steps[steps.length - 1].position) + 1;

  return (
    <details className="mt-3 rounded-md border p-3" open={steps.length > 0 ? undefined : false}>
      <summary className="cursor-pointer text-sm font-medium">
        Étapes ({steps.length})
      </summary>
      <div className="mt-3 flex flex-col gap-2">
        {steps.map((step) => (
          <ItemCard key={step.id} config={methodStepConfig} item={step} />
        ))}
        {adding ? (
          <EntityForm
            config={methodStepConfig}
            fixedValues={{ methodId }}
            defaults={{ position: String(nextPosition) }}
            onDone={() => setAdding(false)}
          />
        ) : (
          <Button size="sm" variant="outline" className="self-start" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Ajouter une étape
          </Button>
        )}
      </div>
    </details>
  );
}
