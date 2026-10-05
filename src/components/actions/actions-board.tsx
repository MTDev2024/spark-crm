"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingGate } from "@/components/shared/loading-gate";
import { groupOpenActions, toDateString, type ActionBucket } from "@/lib/domain/actions";
import { useCrm } from "@/lib/store/crm-store";
import { ActionItem } from "./action-item";

/** Ordre et titre des groupes affichés, du plus urgent au moins urgent. */
const groups: { bucket: ActionBucket; title: string }[] = [
  { bucket: "overdue", title: "En retard" },
  { bucket: "today", title: "Aujourd'hui" },
  { bucket: "upcoming", title: "À venir" },
  { bucket: "no_date", title: "Sans échéance" },
];

/** Page Actions : toutes les actions à faire, groupées par échéance, + les terminées. */
export function ActionsBoard() {
  const { state } = useCrm();
  const today = toDateString(new Date());
  const grouped = groupOpenActions(state.actions, today);
  const done = state.actions.filter((a) => a.doneAt !== null);
  const nameOf = (prospectId: string) =>
    state.prospects.find((p) => p.id === prospectId)?.company;
  const hasOpen = groups.some(({ bucket }) => grouped[bucket].length > 0);

  return (
    <LoadingGate>
      {!hasOpen && done.length === 0 ? (
        <EmptyState
          title="Aucune action"
          description="Ajoutez une prochaine action depuis la fiche d'un prospect."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {!hasOpen ? <EmptyState title="Rien à faire pour le moment" /> : null}
          {groups.map(({ bucket, title }) =>
            grouped[bucket].length > 0 ? (
              <section key={bucket}>
                <h2 className="mb-2 text-sm font-semibold">
                  {title} ({grouped[bucket].length})
                </h2>
                <ul className="flex flex-col gap-2">
                  {grouped[bucket].map((action) => (
                    <ActionItem
                      key={action.id}
                      action={action}
                      today={today}
                      prospectName={nameOf(action.prospectId)}
                    />
                  ))}
                </ul>
              </section>
            ) : null,
          )}
          {done.length > 0 ? (
            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                Terminées ({done.length})
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {done.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    today={today}
                    prospectName={nameOf(action.prospectId)}
                  />
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      )}
    </LoadingGate>
  );
}
