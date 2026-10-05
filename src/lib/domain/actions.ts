import type { Action, ActionPriority, Prospect } from "@/types/domain";

/**
 * Logique métier pure autour des actions : aucune dépendance à React ni au
 * stockage, donc facile à tester. Les dates sont des chaînes « YYYY-MM-DD »
 * (jour local) : elles se comparent correctement comme du texte.
 */

/** Où se situe une action par rapport à aujourd'hui. */
export type ActionBucket = "overdue" | "today" | "upcoming" | "no_date";

/** Date du jour au format YYYY-MM-DD, dans le fuseau local de l'utilisateur. */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getBucket(action: Action, today: string): ActionBucket {
  if (action.dueAt === null) return "no_date";
  if (action.dueAt < today) return "overdue";
  if (action.dueAt === today) return "today";
  return "upcoming";
}

const priorityRank: Record<ActionPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

/**
 * Tri d'affichage : échéance la plus proche d'abord (sans échéance en
 * dernier), puis priorité la plus haute. Ne modifie pas le tableau d'origine.
 */
export function sortActions(actions: Action[]): Action[] {
  return [...actions].sort((a, b) => {
    if (a.dueAt !== b.dueAt) {
      if (a.dueAt === null) return 1;
      if (b.dueAt === null) return -1;
      return a.dueAt < b.dueAt ? -1 : 1;
    }
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}

export type GroupedActions = Record<ActionBucket, Action[]>;

/** Répartit les actions encore à faire par catégorie d'échéance (terminées ignorées). */
export function groupOpenActions(
  actions: Action[],
  today: string,
): GroupedActions {
  const groups: GroupedActions = {
    overdue: [],
    today: [],
    upcoming: [],
    no_date: [],
  };
  for (const action of sortActions(actions)) {
    if (action.doneAt !== null) continue;
    groups[getBucket(action, today)].push(action);
  }
  return groups;
}

/**
 * Prospects qui n'ont aucune action à faire : c'est exactement la situation
 * à éviter (« je vais réfléchir » sans suite). Alimente les alertes du dashboard.
 */
export function prospectsWithoutNextAction(
  prospects: Prospect[],
  actions: Action[],
): Prospect[] {
  const withOpenAction = new Set(
    actions.filter((a) => a.doneAt === null).map((a) => a.prospectId),
  );
  return prospects.filter((p) => !withOpenAction.has(p.id));
}
