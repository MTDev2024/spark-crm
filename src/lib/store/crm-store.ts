import { useSyncExternalStore } from "react";
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
  interactionFromRow,
  interactionToRow,
  prospectFieldsToRow,
  prospectFromRow,
  prospectToRow,
  type ActionRow,
  type DataPointRow,
  type InteractionRow,
  type ProspectRow,
} from "./mappers";

/**
 * STORE DES DONNÉES (Supabase)
 *
 * Ce fichier est la SEULE porte d'entrée vers les données : les composants
 * lisent via `useCrm()` et écrivent via les fonctions exportées ci-dessous.
 *
 * Fonctionnement :
 *  - Au premier abonnement, tout est chargé depuis Supabase en mémoire.
 *  - Chaque modification met d'abord à jour la mémoire (l'écran réagit
 *    instantanément), puis envoie l'écriture à Supabase en arrière-plan.
 *  - Les écritures partent l'une après l'autre (file d'attente), pour qu'un
 *    prospect soit toujours créé avant ses actions.
 *  - Si une écriture échoue, une erreur est exposée (`error`) et les données
 *    sont rechargées depuis la base : l'écran retrouve l'état réel.
 *  - La sécurité (chaque utilisateur ne voit que ses lignes) est assurée par
 *    la base (RLS), pas par ce code.
 *
 * `useSyncExternalStore` (hook React) abonne les composants au store : à chaque
 * modification on remplace l'objet `cached`, ce qui déclenche leur mise à jour.
 */

export type CrmState = {
  prospects: Prospect[];
  actions: Action[];
  interactions: Interaction[];
  dataPoints: StoredDataPoint[];
};

type Snapshot = {
  state: CrmState;
  /** false tant que les données n'ont pas été chargées depuis la base. */
  hydrated: boolean;
  /** Message d'erreur de synchronisation à afficher, ou null. */
  error: string | null;
};

const EMPTY_STATE: CrmState = {
  prospects: [],
  actions: [],
  interactions: [],
  dataPoints: [],
};

const INITIAL_SNAPSHOT: Snapshot = {
  state: EMPTY_STATE,
  hydrated: false,
  error: null,
};

let cached: Snapshot = INITIAL_SNAPSHOT;
let loadStarted = false;
const listeners = new Set<() => void>();

function publish(next: Snapshot): void {
  cached = next;
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Snapshot {
  return cached;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Premier abonné côté navigateur : on lance le chargement des données.
  if (!loadStarted) {
    loadStarted = true;
    void load();
  }
  return () => {
    listeners.delete(listener);
  };
}

/** Hook de lecture : { state, hydrated, error }. */
export function useCrm(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_SNAPSHOT);
}

/** Message affiché à l'utilisateur quand la base est injoignable ou refuse l'écriture. */
function describeError(error: { message: string } | null | undefined): string {
  return `Erreur de synchronisation avec la base : ${error?.message ?? "inconnue"}`;
}

/** Charge les quatre tables en parallèle et remplace l'état en mémoire. */
async function load(): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const [prospects, actions, interactions, dataPoints] = await Promise.all([
      supabase.from("prospects").select("*").order("created_at", { ascending: false }),
      supabase.from("actions").select("*"),
      supabase.from("interactions").select("*"),
      supabase.from("data_points").select("*"),
    ]);
    const failure = [prospects, actions, interactions, dataPoints].find((r) => r.error);
    if (failure) {
      publish({ ...cached, hydrated: true, error: describeError(failure.error) });
      return;
    }
    publish({
      hydrated: true,
      error: null,
      state: {
        prospects: (prospects.data as ProspectRow[]).map(prospectFromRow),
        actions: (actions.data as ActionRow[]).map(actionFromRow),
        interactions: (interactions.data as InteractionRow[]).map(interactionFromRow),
        dataPoints: (dataPoints.data as DataPointRow[]).map(dataPointFromRow),
      },
    });
  } catch (error) {
    publish({ ...cached, hydrated: true, error: describeError(error as Error) });
  }
}

/* ------------------------- écriture en arrière-plan ------------------------ */

// File d'attente : chaque écriture attend la fin de la précédente.
let writeQueue: Promise<void> = Promise.resolve();

/**
 * Met une écriture en file. `write` renvoie l'erreur éventuelle de Supabase.
 * En cas d'échec : on affiche l'erreur puis on recharge l'état réel de la base.
 */
function enqueue(
  write: () => PromiseLike<{ error: { message: string } | null }>,
): void {
  writeQueue = writeQueue.then(async () => {
    try {
      const { error } = await write();
      if (error) throw new Error(error.message);
    } catch (error) {
      publish({ ...cached, error: describeError(error as Error) });
      await load();
      // load() efface l'erreur si le rechargement réussit : on la remet pour qu'elle reste visible.
      publish({ ...cached, error: describeError(error as Error) });
    }
  });
}

/** Masque le message d'erreur (bouton « Fermer »). */
export function dismissError(): void {
  publish({ ...cached, error: null });
}

/** Remplace l'état en mémoire (affichage immédiat avant l'écriture en base). */
function setState(update: (state: CrmState) => CrmState): void {
  publish({ ...cached, state: update(cached.state) });
}

function newId(): string {
  return crypto.randomUUID();
}

/** Jour local au format YYYY-MM-DD (pas l'UTC, pour rester cohérent avec les échéances). */
function today(): string {
  return toDateString(new Date());
}

const db = () => getSupabaseBrowserClient();

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
