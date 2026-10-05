import { toDateString } from "@/lib/domain/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Action,
  Interaction,
  Prospect,
  StoredDataPoint,
} from "@/types/domain";
import {
  actionFromRow,
  actionToRow,
  dataPointFromRow,
  dataPointToRow,
  interactionToRow,
  interactionFromRow,
  prospectFieldsToRow,
  prospectFromRow,
  prospectToRow,
  type ActionRow,
  type DataPointRow,
  type InteractionRow,
  type ProspectRow,
} from "./mappers";
import { createRemoteStore } from "./remote-store";

/**
 * STORE DES DONNÉES PROSPECTS (Supabase)
 *
 * Porte d'entrée unique vers les prospects, actions, interactions et données :
 * les composants lisent via `useCrm()` et écrivent via les fonctions exportées
 * ci-dessous. La mécanique (chargement, file d'écriture, erreurs) est dans
 * remote-store.ts. La sécurité (chaque utilisateur ne voit que ses lignes) est
 * assurée par la base (RLS), pas par ce code.
 */

export type CrmState = {
  prospects: Prospect[];
  actions: Action[];
  interactions: Interaction[];
  dataPoints: StoredDataPoint[];
};

const EMPTY_STATE: CrmState = {
  prospects: [],
  actions: [],
  interactions: [],
  dataPoints: [],
};

const db = () => getSupabaseBrowserClient();

const store = createRemoteStore<CrmState>({
  empty: EMPTY_STATE,
  /** Charge les quatre tables en parallèle. */
  async load() {
    const supabase = db();
    const [prospects, actions, interactions, dataPoints] = await Promise.all([
      supabase.from("prospects").select("*").order("created_at", { ascending: false }),
      supabase.from("actions").select("*"),
      supabase.from("interactions").select("*"),
      supabase.from("data_points").select("*"),
    ]);
    const failure = [prospects, actions, interactions, dataPoints].find((r) => r.error);
    if (failure) return { state: EMPTY_STATE, error: failure.error };
    return {
      error: null,
      state: {
        prospects: (prospects.data as ProspectRow[]).map(prospectFromRow),
        actions: (actions.data as ActionRow[]).map(actionFromRow),
        interactions: (interactions.data as InteractionRow[]).map(interactionFromRow),
        dataPoints: (dataPoints.data as DataPointRow[]).map(dataPointFromRow),
      },
    };
  },
});

/** Hook de lecture : { state, hydrated, error }. */
export const useCrm = store.useStore;

/** Masque le message d'erreur (bouton « Fermer »). */
export const dismissError = store.dismissError;

const { setState, enqueue } = store;

function newId(): string {
  return crypto.randomUUID();
}

/** Jour local au format YYYY-MM-DD (pas l'UTC, pour rester cohérent avec les échéances). */
function today(): string {
  return toDateString(new Date());
}

/* ------------------------------ Prospects ------------------------------ */

export type ProspectInput = Omit<Prospect, "id" | "createdAt">;

export function addProspect(input: ProspectInput): Prospect {
  const prospect: Prospect = {
    ...input,
    id: newId(),
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ ...s, prospects: [prospect, ...s.prospects] }));
  enqueue(() => db().from("prospects").insert(prospectToRow(prospect)));
  return prospect;
}

export function updateProspect(id: string, input: ProspectInput): void {
  setState((s) => ({
    ...s,
    prospects: s.prospects.map((p) => (p.id === id ? { ...p, ...input } : p)),
  }));
  enqueue(() =>
    db().from("prospects").update(prospectFieldsToRow(input)).eq("id", id),
  );
}

/**
 * Supprime un prospect. La base supprime en cascade ses actions, interactions
 * et données ; on fait de même en mémoire.
 */
export function deleteProspect(id: string): void {
  setState((s) => ({
    prospects: s.prospects.filter((p) => p.id !== id),
    actions: s.actions.filter((a) => a.prospectId !== id),
    interactions: s.interactions.filter((i) => i.prospectId !== id),
    dataPoints: s.dataPoints.filter((d) => d.prospectId !== id),
  }));
  enqueue(() => db().from("prospects").delete().eq("id", id));
}

/* ------------------------------- Actions ------------------------------- */

export type ActionInput = Omit<Action, "id" | "doneAt">;

export function addAction(input: ActionInput): Action {
  const action: Action = { ...input, id: newId(), doneAt: null };
  setState((s) => ({ ...s, actions: [...s.actions, action] }));
  enqueue(() => db().from("actions").insert(actionToRow(action)));
  return action;
}

/** Marque une action terminée, ou la rouvre (done = false). */
export function setActionDone(id: string, done: boolean): void {
  const doneAt = done ? today() : null;
  setState((s) => ({
    ...s,
    actions: s.actions.map((a) => (a.id === id ? { ...a, doneAt } : a)),
  }));
  enqueue(() => db().from("actions").update({ done_at: doneAt }).eq("id", id));
}

/** Supprime une action. Les interactions qui y menaient sont conservées (la base met le lien à vide). */
export function deleteAction(id: string): void {
  setState((s) => ({
    ...s,
    actions: s.actions.filter((a) => a.id !== id),
    interactions: s.interactions.map((i) =>
      i.nextActionId === id ? { ...i, nextActionId: null } : i,
    ),
  }));
  enqueue(() => db().from("actions").delete().eq("id", id));
}

/* ----------------------------- Interactions ---------------------------- */

export type InteractionInput = Omit<
  Interaction,
  "id" | "nextActionId" | "noNextAction"
>;

/**
 * Enregistre une interaction ET sa suite :
 * - `nextAction` fourni  → l'action est créée et liée à l'interaction ;
 * - `nextAction` = null  → l'interaction est marquée « aucune prochaine action ».
 * Il est impossible de créer une interaction sans trancher.
 * En base, l'action est écrite avant l'interaction (l'interaction la référence).
 */
export function addInteraction(
  input: InteractionInput,
  nextAction: Omit<ActionInput, "prospectId"> | null,
): Interaction {
  const action: Action | null = nextAction
    ? { ...nextAction, prospectId: input.prospectId, id: newId(), doneAt: null }
    : null;
  const interaction: Interaction = {
    ...input,
    id: newId(),
    nextActionId: action?.id ?? null,
    noNextAction: action === null,
  };
  setState((s) => ({
    ...s,
    interactions: [interaction, ...s.interactions],
    actions: action ? [...s.actions, action] : s.actions,
  }));
  if (action) enqueue(() => db().from("actions").insert(actionToRow(action)));
  enqueue(() => db().from("interactions").insert(interactionToRow(interaction)));
  return interaction;
}

/* ------------------------------ Data points ---------------------------- */

export type DataPointInput = Omit<StoredDataPoint, "id" | "verifiedAt" | "confidence">;

export function addDataPoint(input: DataPointInput): void {
  const dataPoint: StoredDataPoint = {
    ...input,
    id: newId(),
    verifiedAt: null,
    confidence: null,
  };
  setState((s) => ({ ...s, dataPoints: [...s.dataPoints, dataPoint] }));
  enqueue(() => db().from("data_points").insert(dataPointToRow(dataPoint)));
}

export function deleteDataPoint(id: string): void {
  setState((s) => ({ ...s, dataPoints: s.dataPoints.filter((d) => d.id !== id) }));
  enqueue(() => db().from("data_points").delete().eq("id", id));
}
