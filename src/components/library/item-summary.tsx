"use client";

import type { EntityConfig, FieldDef } from "@/config/library";
import { useLibrary } from "@/lib/store/library-store";
import type { LibraryItem } from "@/types/library";

/**
 * Affiche les champs renseignés d'un élément sous forme « libellé : valeur ».
 * Les champs vides sont masqués (un champ inconnu n'est jamais complété) ;
 * les listes s'affichent en puces, les liens entre éléments par leur titre.
 */
export function ItemSummary({
  config,
  item,
}: {
  config: EntityConfig;
  item: LibraryItem;
}) {
  const { state } = useLibrary();

  function display(field: FieldDef): React.ReactNode {
    const value = item[field.name];
    if (value === null || value === undefined || value === "") return null;

    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return (
        <ul className="list-disc pl-5">
          {value.map((entry, index) => (
            <li key={index}>{String(entry)}</li>
          ))}
        </ul>
      );
    }
    if (field.kind === "select") {
      return field.options?.find((o) => o.value === value)?.label ?? String(value);
    }
    if (field.kind === "relation") {
      const target = field.relation!;
      const linked = state[target.table].find((other) => other.id === value);
      return linked ? String(linked[target.labelField]) : "Élément supprimé";
    }
    if (field.kind === "url") {
      return (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" className="underline">
          {String(value)}
        </a>
      );
    }
    return <span className="whitespace-pre-wrap">{String(value)}</span>;
  }

  const rows = config.fields
    .filter((field) => field.name !== config.titleField && !field.hideInSummary)
    .map((field) => ({ field, content: display(field) }))
    .filter((row) => row.content !== null);

  if (rows.length === 0) return null;

  return (
    <dl className="mt-2 flex flex-col gap-1.5 text-sm">
      {rows.map(({ field, content }) => (
        <div key={field.name}>
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd>{content}</dd>
        </div>
      ))}
    </dl>
  );
}
