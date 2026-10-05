"use client";

import { Button } from "@/components/ui/button";
import { dismissError, useCrm } from "@/lib/store/crm-store";

/**
 * Bandeau d'erreur : affiché quand une lecture ou une écriture vers la base a
 * échoué. Les données affichées sont alors celles rechargées depuis la base.
 */
export function ErrorBanner({
  error,
  onDismiss,
}: {
  error: string | null;
  onDismiss: () => void;
}) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
    >
      <p>{error}</p>
      <Button size="sm" variant="outline" onClick={onDismiss}>
        Fermer
      </Button>
    </div>
  );
}

/** Bandeau global (erreurs des données prospects), placé dans le shell. */
export function SyncBanner() {
  const { error } = useCrm();
  if (!error) return null;
  return (
    <div className="mb-4">
      <ErrorBanner error={error} onDismiss={dismissError} />
    </div>
  );
}
