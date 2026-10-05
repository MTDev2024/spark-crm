"use client";

import Link from "next/link";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actionTypeLabels, priorityLabels } from "@/config/labels";
import { getBucket } from "@/lib/domain/actions";
import { deleteAction, setActionDone } from "@/lib/store/crm-store";
import type { Action } from "@/types/domain";

/** 2026-10-05 → 05/10/2026 (affichage français). */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Une ligne d'action : type, objectif, prospect, échéance, priorité, raison
 * et boutons Terminer / Rouvrir / Supprimer.
 * Réutilisée sur la fiche prospect, la page Actions et le dashboard.
 * `prospectName` est fourni uniquement quand on affiche des actions de plusieurs prospects.
 */
export function ActionItem({
  action,
  today,
  prospectName,
}: {
  action: Action;
  today: string;
  prospectName?: string;
}) {
  const done = action.doneAt !== null;
  const bucket = getBucket(action, today);

  return (
    <li className="flex items-start gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{actionTypeLabels[action.type]}</Badge>
          {action.priority === "high" ? (
            <Badge variant="destructive">{priorityLabels.high}</Badge>
          ) : null}
          {!done && bucket === "overdue" ? (
            <Badge variant="destructive">En retard</Badge>
          ) : null}
          {action.dueAt ? (
            <span className="text-xs text-muted-foreground">
              {formatDate(action.dueAt)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sans échéance</span>
          )}
        </div>
        <p className={done ? "mt-1 text-sm line-through" : "mt-1 text-sm font-medium"}>
          {action.objective}
        </p>
        {prospectName ? (
          <Link
            href={`/prospects/${action.prospectId}`}
            className="text-sm text-muted-foreground underline"
          >
            {prospectName}
          </Link>
        ) : null}
        {action.reason ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{action.reason}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          size="sm"
          variant={done ? "outline" : "default"}
          onClick={() => setActionDone(action.id, !done)}
        >
          {done ? (
            <RotateCcw className="size-4" aria-hidden />
          ) : (
            <Check className="size-4" aria-hidden />
          )}
          {done ? "Rouvrir" : "Terminer"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-label="Supprimer l'action"
          onClick={() => {
            if (window.confirm("Supprimer cette action ?")) deleteAction(action.id);
          }}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  );
}
