"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionItem } from "@/components/actions/action-item";
import { EmptyState } from "@/components/shared/empty-state";
import {
  groupOpenActions,
  prospectsWithoutNextAction,
  toDateString,
} from "@/lib/domain/actions";
import { useCrm } from "@/lib/store/crm-store";

/**
 * Blocs du dashboard alimentés par les vraies données (store local).
 * Avant l'hydratation (`hydrated` faux) on n'affiche pas d'état vide trompeur.
 */

/** « À faire aujourd'hui » : actions en retard + actions du jour. Priorité absolue du dashboard. */
export function TodayBlock({ className }: { className?: string }) {
  const { state, hydrated } = useCrm();
  const today = toDateString(new Date());
  const grouped = groupOpenActions(state.actions, today);
  const items = [...grouped.overdue, ...grouped.today];
  const nameOf = (id: string) => state.prospects.find((p) => p.id === id)?.company;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>À faire aujourd&apos;hui</CardTitle>
      </CardHeader>
      <CardContent>
        {!hydrated ? null : items.length === 0 ? (
          <EmptyState
            title="Rien d'urgent aujourd'hui"
            description="Les actions en retard et celles du jour apparaissent ici."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                today={today}
                prospectName={nameOf(action.prospectId)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Alertes commerciales calculées : prospects sans suite, actions en retard. */
export function AlertsBlock() {
  const { state, hydrated } = useCrm();
  const today = toDateString(new Date());
  const orphans = prospectsWithoutNextAction(state.prospects, state.actions);
  const overdue = groupOpenActions(state.actions, today).overdue;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes commerciales</CardTitle>
      </CardHeader>
      <CardContent>
        {!hydrated ? null : orphans.length === 0 && overdue.length === 0 ? (
          <EmptyState title="Aucune alerte" />
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {overdue.length > 0 ? (
              <li className="flex items-center gap-2">
                <Badge variant="destructive">{overdue.length}</Badge>
                action{overdue.length > 1 ? "s" : ""} en retard
              </li>
            ) : null}
            {orphans.length > 0 ? (
              <li>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{orphans.length}</Badge>
                  prospect{orphans.length > 1 ? "s" : ""} sans prochaine action
                </div>
                <ul className="mt-1 ml-1 flex flex-col gap-0.5">
                  {orphans.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <Link href={`/prospects/${p.id}`} className="text-muted-foreground underline">
                        {p.company}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** Les 5 derniers prospects créés. */
export function RecentProspectsBlock() {
  const { state, hydrated } = useCrm();
  const recent = state.prospects.slice(0, 5); // le store place les plus récents en premier

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospects récents</CardTitle>
      </CardHeader>
      <CardContent>
        {!hydrated ? null : recent.length === 0 ? (
          <EmptyState title="Aucun prospect" />
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/prospects/${p.id}`} className="underline">
                  {p.company}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
