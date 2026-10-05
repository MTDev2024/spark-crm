import { useSyncExternalStore } from "react";

/**
 * MÉCANIQUE COMMUNE DES STORES (Supabase)
 *
 * `createRemoteStore` fabrique un store dont l'état vit en mémoire et se
 * synchronise avec la base. Il est utilisé par crm-store.ts (prospects) et
 * library-store.ts (base commerciale). Fonctionnement :
 *
 *  - Au premier abonnement côté navigateur, `load()` charge tout depuis la base.
 *  - Chaque modification met d'abord à jour la mémoire (l'écran réagit
 *    instantanément) via `setState`, puis l'écriture est mise en file avec
 *    `enqueue`.
 *  - Les écritures partent l'une après l'autre : un parent est toujours écrit
 *    avant ses enfants.
 *  - Si une écriture échoue : une erreur est exposée (`error`) et l'état est
 *    rechargé depuis la base, pour que l'écran retrouve la réalité.
 *
 * `useSyncExternalStore` (hook React) abonne les composants : à chaque
 * changement on remplace l'objet `cached`, ce qui les redessine.
 */

export type StoreSnapshot<S> = {
  state: S;
  /** false tant que les données n'ont pas été chargées depuis la base. */
  hydrated: boolean;
  /** Message d'erreur de synchronisation à afficher, ou null. */
  error: string | null;
};

type DbError = { message: string } | null;

/** Message affiché quand la base est injoignable ou refuse une opération. */
export function describeError(error: { message: string } | null | undefined): string {
  return `Erreur de synchronisation avec la base : ${error?.message ?? "inconnue"}`;
}

export function createRemoteStore<S>(options: {
  /** État vide, utilisé avant le chargement et côté serveur. */
  empty: S;
  /** Lit toute la base ; renvoie l'état, ou une erreur de la base. */
  load: () => Promise<{ state: S; error: DbError }>;
}) {
  const initial: StoreSnapshot<S> = {
    state: options.empty,
    hydrated: false,
    error: null,
  };
  let cached = initial;
  let loadStarted = false;
  let writeQueue: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();

  function publish(next: StoreSnapshot<S>): void {
    cached = next;
    listeners.forEach((listener) => listener());
  }

  /** Recharge l'état depuis la base (efface l'erreur si tout va bien). */
  async function reload(): Promise<void> {
    try {
      const { state, error } = await options.load();
      if (error) {
        publish({ ...cached, hydrated: true, error: describeError(error) });
      } else {
        publish({ state, hydrated: true, error: null });
      }
    } catch (error) {
      publish({ ...cached, hydrated: true, error: describeError(error as Error) });
    }
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    if (!loadStarted) {
      loadStarted = true;
      void reload();
    }
    return () => {
      listeners.delete(listener);
    };
  }

  /** Hook de lecture : { state, hydrated, error }. */
  function useStore(): StoreSnapshot<S> {
    return useSyncExternalStore(
      subscribe,
      () => cached,
      () => initial,
    );
  }

  /** Remplace l'état en mémoire (affichage immédiat avant l'écriture en base). */
  function setState(update: (state: S) => S): void {
    publish({ ...cached, state: update(cached.state) });
  }

  /**
   * Met une écriture en file. `write` renvoie l'erreur éventuelle de la base.
   * `reloadAfter` : recharger ensuite l'état réel (utile quand la base modifie
   * d'autres lignes, par exemple une suppression qui met des liens à vide).
   */
  function enqueue(
    write: () => PromiseLike<{ error: DbError }>,
    reloadAfter = false,
  ): void {
    writeQueue = writeQueue.then(async () => {
      try {
        const { error } = await write();
        if (error) throw new Error(error.message);
        if (reloadAfter) await reload();
      } catch (error) {
        await reload();
        // reload() efface l'erreur s'il réussit : on la remet pour qu'elle reste visible.
        publish({ ...cached, error: describeError(error as Error) });
      }
    });
  }

  /** Masque le message d'erreur (bouton « Fermer »). */
  function dismissError(): void {
    publish({ ...cached, error: null });
  }

  return { useStore, setState, enqueue, dismissError, getState: () => cached.state };
}
