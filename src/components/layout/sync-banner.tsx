"use client";

import { Button } from "@/components/ui/button";
import { dismissError, useCrm } from "@/lib/store/crm-store";

/**
 * Bandeau affiché en haut de l'écran quand une lecture ou une écriture vers la
 * base a échoué. Les données affichées sont alors celles rechargées depuis la base.
 */
export function SyncBanner() {
  const { error } = useCrm();
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
    >
      <p>{error}</p>
      <Button size="sm" variant="outline" onClick={dismissError}>
        Fermer
      </Button>
    </div>
  );
}
