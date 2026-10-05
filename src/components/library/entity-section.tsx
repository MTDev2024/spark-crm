"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBanner } from "@/components/layout/sync-banner";
import { LoadingGate } from "@/components/shared/loading-gate";
import type { EntityConfig } from "@/config/library";
import { dismissLibraryError, useLibrary } from "@/lib/store/library-store";
import { EntityForm } from "./entity-form";
import { ItemCard } from "./item-card";

/**
 * Page d'une section de la bibliothèque (méthodes, offres, sources…) :
 * liste des éléments triés, bouton d'ajout et formulaire de création.
 * Le même composant sert toutes les sections, selon la description reçue.
 */
export function EntitySection({ config }: { config: EntityConfig }) {
  const { state, hydrated, error } = useLibrary();
  const [adding, setAdding] = useState(false);

  const items = [...state[config.table]].sort((a, b) =>
    String(a[config.titleField] ?? "").localeCompare(String(b[config.titleField] ?? ""), "fr"),
  );

  return (
    <div className="flex flex-col gap-4">
      <ErrorBanner error={error} onDismiss={dismissLibraryError} />
      {!adding && hydrated ? (
        <Button className="self-start" onClick={() => setAdding(true)}>
          <Plus className="size-4" aria-hidden />
          Ajouter
        </Button>
      ) : null}
      {adding ? <EntityForm config={config} onDone={() => setAdding(false)} /> : null}
      <LoadingGate>
        {items.length === 0 && !adding ? (
          <EmptyState title={`Aucun élément dans « ${config.label} »`} description={config.emptyHint} />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} config={config} item={item} />
            ))}
          </div>
        )}
      </LoadingGate>
    </div>
  );
}
