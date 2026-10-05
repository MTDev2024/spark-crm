import { useSyncExternalStore } from "react";
import { toDateString } from "@/lib/domain/actions";
import type {
  Action,
  Interaction,
  Prospect,
  StoredDataPoint,
} from "@/types/domain";

/**
 * STORE LOCAL (phase 2)
 *
 * Toutes les données vivent dans le navigateur (localStorage) en attendant
 * Supabase (phase 3). Ce fichier est la SEULE porte d'entrée vers les données :
 * les composants lisent via `useCrm()` et écrivent via les fonctions exportées.
 * Le jour où Supabase arrive, on remplace ce fichier sans toucher aux écrans.
 *
 * Limite assumée : les données restent dans CE navigateur et disparaissent si
 * l'on vide les données du site.
 *
 * Fonctionnement : `useSyncExternalStore` (hook React) abonne les composants
 * au store. À chaque modification, on remplace l'objet `cached` par un nouvel
 * objet, ce qui prévient React qu'il doit se re-rendre.
 */

const STORAGE_KEY = "spark-crm:v1";

export type CrmState = {
  prospects: Prospect[];
  actions: Action[];
  interactions: Interaction[];
  dataPoints: StoredDataPoint[];
};

type Snapshot = {
  state: CrmState;
  /** false pendant le rendu serveur et le premier rendu client : les données ne sont pas encore lues. */
  hydrated: boolean;
};

const EMPTY_STATE: CrmState = {
  prospects: [],
  actions: [],
  interactions: [],
  dataPoints: [],
};

/** Instantané utilisé côté serveur : le serveur n'a pas accès au localStorage. */
const SERVER_SNAPSHOT: Snapshot = { state: EMPTY_STATE, hydrated: false };

let cached: Snapshot | null = null;
const listeners = new Set<() => void>();

/** Lit le localStorage. Toute donnée illisible est ignorée plutôt que de faire planter l'app. */
function loadState(): CrmState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<CrmState>;
    return {
      prospects: Array.isArray(parsed.prospects) ? parsed.prospects : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      interactions: Array.isArray(parsed.interactions)
        ? parsed.interactions
        : [],
      dataPoints: Array.isArray(parsed.dataPoints) ? parsed.dataPoints : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function getSnapshot(): Snapshot {
  if (cached === null) cached = { state: loadState(), hydrated: true };
  return cached;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Un autre onglet a modifié les données : on relit le localStorage.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Enregistre le nouvel état, le persiste et prévient les composants abonnés. */
function commit(state: CrmState): void {
  cached = { state, hydrated: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Stockage plein ou bloqué : l'état reste en mémoire pour la session.
  }
  listeners.forEach((listener) => listener());
}

/** Hook de lecture : { state, hydrated }. */
export function useCrm(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

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
  const prospect: Prospect = { ...input, id: newId(), createdAt: today() };
  const { state } = getSnapshot();
  commit({ ...state, prospects: [prospect, ...state.prospects] });
  return prospect;
}

export function updateProspect(id: string, input: ProspectInput): void {
  const { state } = getSnapshot();
  commit({
    ...state,
    prospects: state.prospects.map((p) => (p.id === id ? { ...p, ...input } : p)),
  });
}

/** Supprime un prospect ET tout ce qui lui est rattaché (actions, interactions, données). */
export function deleteProspect(id: string): void {
  const { state } = getSnapshot();
  commit({
    prospects: state.prospects.filter((p) => p.id !== id),
    actions: state.actions.filter((a) => a.prospectId !== id),
    interactions: state.interactions.filter((i) => i.prospectId !== id),
    dataPoints: state.dataPoints.filter((d) => d.prospectId !== id),
  });
}

/* ------------------------------- Actions ------------------------------- */

export type ActionInput = Omit<Action, "id" | "doneAt">;

export function addAction(input: ActionInput): Action {
  const action: Action = { ...input, id: newId(), doneAt: null };
  const { state } = getSnapshot();
  commit({ ...state, actions: [...state.actions, action] });
  return action;
}

/** Marque une action terminée, ou la rouvre (done = false). */
export function setActionDone(id: string, done: boolean): void {
  const { state } = getSnapshot();
  commit({
    ...state,
    actions: state.actions.map((a) =>
      a.id === id ? { ...a, doneAt: done ? today() : null } : a,
    ),
  });
}

export function deleteAction(id: string): void {
  const { state } = getSnapshot();
  commit({ ...state, actions: state.actions.filter((a) => a.id !== id) });
}

/* ----------------------------- Interactions ---------------------------- */

export type InteractionInput = Omit<
  Interaction,
  "id" | "nextActionId" | "noNextAction"
>;

/**
 * Enregistre une interaction ET sa suite en une seule écriture :
 * - `nextAction` fourni  → l'action est créée et liée à l'interaction ;
 * - `nextAction` = null  → l'interaction est marquée « aucune prochaine action ».
 * Il est impossible de créer une interaction sans trancher.
 */
export function addInteraction(
  input: InteractionInput,
  nextAction: Omit<ActionInput, "prospectId"> | null,
): Interaction {
  const { state } = getSnapshot();
  const action: Action | null = nextAction
    ? { ...nextAction, prospectId: input.prospectId, id: newId(), doneAt: null }
    : null;
  const interaction: Interaction = {
    ...input,
    id: newId(),
    nextActionId: action?.id ?? null,
    noNextAction: action === null,
  };
  commit({
    ...state,
    interactions: [interaction, ...state.interactions],
    actions: action ? [...state.actions, action] : state.actions,
  });
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
  const { state } = getSnapshot();
  commit({ ...state, dataPoints: [...state.dataPoints, dataPoint] });
}

export function deleteDataPoint(id: string): void {
  const { state } = getSnapshot();
  commit({ ...state, dataPoints: state.dataPoints.filter((d) => d.id !== id) });
}
