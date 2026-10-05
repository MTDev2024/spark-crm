import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LibraryItem, LibraryTable } from "@/types/library";
import { keysToCamel, keysToSnake } from "./case";
import { createRemoteStore } from "./remote-store";

/**
 * STORE DE LA BASE COMMERCIALE (Supabase)
 *
 * Même principe que crm-store.ts (mécanique dans remote-store.ts), mais
 * générique : les huit tables de la bibliothèque (sources, méthodes, étapes,
 * offres, réalisations, arguments, objections, règles) partagent les mêmes
 * fonctions. Les champs de chaque table sont décrits dans src/config/library.ts.
 */

export const libraryTables: LibraryTable[] = [
  "sources",
  "sales_methods",
  "sales_method_steps",
  "offers",
  "realizations",
  "sales_arguments",
  "objections",
  "commercial_rules",
];

export type LibraryState = Record<LibraryTable, LibraryItem[]>;

const EMPTY_STATE = Object.fromEntries(
  libraryTables.map((table) => [table, [] as LibraryItem[]]),
) as LibraryState;

const db = () => getSupabaseBrowserClient();

const store = createRemoteStore<LibraryState>({
  empty: EMPTY_STATE,
  /** Charge les huit tables en parallèle. */
  async load() {
    const results = await Promise.all(
      libraryTables.map((table) => db().from(table).select("*")),
    );
    const failure = results.find((r) => r.error);
    if (failure) return { state: EMPTY_STATE, error: failure.error };
    const state = Object.fromEntries(
      libraryTables.map((table, index) => [
        table,
        (results[index].data as Record<string, unknown>[]).map((row) => {
          // user_id n'a aucune utilité côté interface.
          const { user_id: _userId, ...rest } = row;
          void _userId;
          return keysToCamel<LibraryItem>(rest);
        }),
      ]),
    ) as LibraryState;
    return { state, error: null };
  },
});

/** Hook de lecture : { state, hydrated, error }. */
export const useLibrary = store.useStore;
export const dismissLibraryError = store.dismissError;

const { setState, enqueue } = store;

/** Ajoute un élément ; `values` contient les champs validés (camelCase). */
export function addItem(
  table: LibraryTable,
  values: Record<string, unknown>,
): LibraryItem {
  const item: LibraryItem = {
    ...values,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ ...s, [table]: [...s[table], item] }));
  // createdAt est rempli par la base : on ne l'envoie pas.
  const row = keysToSnake({ ...values, id: item.id });
  enqueue(() => db().from(table).insert(row));
  return item;
}

export function updateItem(
  table: LibraryTable,
  id: string,
  values: Record<string, unknown>,
): void {
  setState((s) => ({
    ...s,
    [table]: s[table].map((item) => (item.id === id ? { ...item, ...values } : item)),
  }));
  enqueue(() => db().from(table).update(keysToSnake(values)).eq("id", id));
}

/**
 * Supprime un élément. Supprimer une méthode supprime ses étapes (cascade en
 * base) ; supprimer une source ou une méthode peut modifier d'autres lignes
 * (liens remis à vide) : on recharge l'état réel après l'écriture.
 */
export function deleteItem(table: LibraryTable, id: string): void {
  setState((s) => {
    const next = { ...s, [table]: s[table].filter((item) => item.id !== id) };
    if (table === "sales_methods") {
      next.sales_method_steps = s.sales_method_steps.filter((step) => step.methodId !== id);
    }
    return next;
  });
  const needsReload = table === "sources" || table === "sales_methods";
  enqueue(() => db().from(table).delete().eq("id", id), needsReload);
}
