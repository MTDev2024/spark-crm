"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/components/actions/action-item";
import { EmptyState } from "@/components/shared/empty-state";
import { channelLabels } from "@/config/labels";
import type { Action, Interaction } from "@/types/domain";
import { InteractionForm } from "./interaction-form";

/**
 * Historique des interactions : répond à « qu'est-ce qui s'est passé avec ce
 * prospect jusqu'à maintenant ? ». Les plus récentes d'abord.
 */
export function InteractionsPanel({
  prospectId,
  interactions,
  actions,
}: {
  prospectId: string;
  interactions: Interaction[];
  actions: Action[];
}) {
  const [adding, setAdding] = useState(false);
  const sorted = [...interactions].sort((a, b) =>
    a.occurredAt < b.occurredAt ? 1 : -1,
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Historique</CardTitle>
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Ajouter une interaction
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {adding ? (
          <InteractionForm prospectId={prospectId} onDone={() => setAdding(false)} />
        ) : null}
        {sorted.length === 0 && !adding ? (
          <EmptyState
            title="Aucune interaction"
            description="Enregistrez ici chaque appel, visite, email ou message."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((interaction) => {
              const next = actions.find((a) => a.id === interaction.nextActionId);
              return (
                <li key={interaction.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{channelLabels[interaction.channel]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(interaction.occurredAt)}
                    </span>
                  </div>
                  {interaction.objective ? (
                    <p className="mt-1">
                      <span className="text-muted-foreground">Objectif : </span>
                      {interaction.objective}
                    </p>
                  ) : null}
                  {interaction.outcome ? (
                    <p>
                      <span className="text-muted-foreground">Résultat : </span>
                      {interaction.outcome}
                    </p>
                  ) : null}
                  {interaction.notes ? (
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {interaction.notes}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {interaction.noNextAction
                      ? "Aucune prochaine action (choix explicite)"
                      : next
                        ? `Suite : ${next.objective}${next.dueAt ? ` · ${formatDate(next.dueAt)}` : ""}`
                        : "Suite : action supprimée"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
