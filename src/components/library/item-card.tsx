"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  methodStatusOptions,
  sourceStatusOptions,
  type EntityConfig,
} from "@/config/library";
import { deleteItem, useLibrary } from "@/lib/store/library-store";
import type { LibraryItem } from "@/types/library";
import { EntityForm } from "./entity-form";
import { ItemSummary } from "./item-summary";
import { StepsPanel } from "./steps-panel";

const labelOf = (options: { value: string; label: string }[], value: unknown) =>
  options.find((option) => option.value === value)?.label ?? String(value);

/**
 * Carte d'un élément : titre, statut, résumé des champs, Modifier / Supprimer.
 * En modification, la carte est remplacée par le formulaire.
 * Les cartes de méthodes affichent en plus leurs étapes et un avertissement si
 * la source rattachée n'est pas validée pour utilisation.
 */
export function ItemCard({
  config,
  item,
}: {
  config: EntityConfig;
  item: LibraryItem;
}) {
  const { state } = useLibrary();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EntityForm config={config} item={item} onDone={() => setEditing(false)} />;
  }

  const title = String(item[config.titleField] ?? "");
  const isMethod = config.table === "sales_methods";
  const isSource = config.table === "sources";
  const methodSource = isMethod
    ? state.sources.find((source) => source.id === item.sourceId)
    : undefined;

  function handleDelete() {
    // Une source utilisée par une méthode ne peut pas être supprimée (aussi imposé par la base).
    if (isSource && state.sales_methods.some((m) => m.sourceId === item.id)) {
      window.alert("Cette source est utilisée par au moins une méthode. Détachez-la d'abord.");
      return;
    }
    const extra = isMethod ? " Ses étapes seront aussi supprimées." : "";
    if (window.confirm(`Supprimer « ${title} » ?${extra}`)) deleteItem(config.table, item.id);
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">
            {config.table === "sales_method_steps" ? `${String(item.position)}. ` : ""}
            {title}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {isSource ? (
              <Badge variant="secondary">{labelOf(sourceStatusOptions, item.status)}</Badge>
            ) : null}
            {isMethod ? (
              <>
                <Badge variant={item.status === "validated" ? "default" : "secondary"}>
                  {labelOf(methodStatusOptions, item.status)}
                </Badge>
                <Badge variant="outline">v{String(item.version)}</Badge>
                {!methodSource ? <Badge variant="outline">Sans source</Badge> : null}
                {methodSource && methodSource.status !== "validated_for_use" ? (
                  <Badge variant="outline">Source non validée pour utilisation</Badge>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="outline" aria-label={`Modifier ${title}`} onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button size="sm" variant="ghost" aria-label={`Supprimer ${title}`} onClick={handleDelete}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <ItemSummary config={config} item={item} />
      {isMethod ? <StepsPanel methodId={item.id} /> : null}
    </div>
  );
}
