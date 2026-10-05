"use client";

import { useCrm } from "@/lib/store/crm-store";

/**
 * Les données sont dans le navigateur : avant l'hydratation, on ne peut pas
 * savoir si un prospect « n'existe pas » ou « n'est pas encore chargé ».
 * Cette enveloppe affiche un texte neutre jusqu'à ce que les données soient lues.
 */
export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { hydrated } = useCrm();
  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }
  return <>{children}</>;
}
