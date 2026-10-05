"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionItem } from "@/components/actions/action-item";
import { EmptyState } from "@/components/shared/empty-state";
import { sortActions } from "@/lib/domain/actions";
import type { Action } from "@/types/domain";
import { ActionForm } from "./action-form";

/**
 * Actions du prospect : celles à faire d'abord (triées par échéance), puis les
 * terminées. Affiche un avertissement tant qu'aucune action n'est à faire.
 */
export function ActionsPanel({
  prospectId,
  actions,
  today,
}: {
  prospectId: string;
  actions: Action[];
  today: string;
}) {
  const [adding, setAdding] = useState(false);
  const open = sortActions(actions.filter((a) => a.doneAt === null));
  const done = actions.filter((a) => a.doneAt !== null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Prochaines actions</CardTitle>
        {!adding ? (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Ajouter une prochaine action
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {adding ? (
          <ActionForm prospectId={prospectId} onDone={() => setAdding(false)} />
        ) : null}
        {open.length === 0 && !adding ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm">
            <Badge variant="outline">Attention</Badge>
            Aucune prochaine action définie pour ce prospect.
          </div>
        ) : null}
        <ul className="flex flex-col gap-2">
          {open.map((action) => (
            <ActionItem key={action.id} action={action} today={today} />
          ))}
        </ul>
        {done.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">
              {done.length} action{done.length > 1 ? "s" : ""} terminée{done.length > 1 ? "s" : ""}
            </summary>
            <ul className="mt-2 flex flex-col gap-2">
              {done.map((action) => (
                <ActionItem key={action.id} action={action} today={today} />
              ))}
            </ul>
          </details>
        ) : null}
        {actions.length === 0 && !adding ? (
          <EmptyState title="Aucune action enregistrée" />
        ) : null}
      </CardContent>
    </Card>
  );
}
