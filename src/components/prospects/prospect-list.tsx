"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingGate } from "@/components/shared/loading-gate";
import { formatDate } from "@/components/actions/action-item";
import { sortActions } from "@/lib/domain/actions";
import { useCrm } from "@/lib/store/crm-store";

/**
 * Liste des prospects avec recherche (entreprise, contact, ville, activité).
 * Pour chaque prospect on montre sa prochaine action, ou un avertissement
 * s'il n'en a aucune : c'est la situation que le produit cherche à éviter.
 */
export function ProspectList() {
  const { state } = useCrm();
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const prospects = state.prospects.filter((p) =>
    [p.company, p.contactName, p.city, p.activity].some((field) =>
      field?.toLowerCase().includes(needle),
    ),
  );

  return (
    <LoadingGate>
      {state.prospects.length === 0 ? (
        <EmptyState
          title="Aucun prospect"
          description="Créez votre premier prospect pour commencer."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Input
            type="search"
            placeholder="Rechercher un prospect…"
            aria-label="Rechercher un prospect"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {prospects.length === 0 ? (
            <EmptyState title="Aucun résultat" />
          ) : (
            <ul className="flex flex-col gap-2">
              {prospects.map((prospect) => {
                const next = sortActions(
                  state.actions.filter(
                    (a) => a.prospectId === prospect.id && a.doneAt === null,
                  ),
                )[0];
                return (
                  <li key={prospect.id}>
                    <Link
                      href={`/prospects/${prospect.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{prospect.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {[prospect.activity, prospect.city]
                            .filter(Boolean)
                            .join(" · ") || "Informations à compléter"}
                        </p>
                      </div>
                      {next ? (
                        <span className="text-sm text-muted-foreground">
                          {next.objective}
                          {next.dueAt ? ` · ${formatDate(next.dueAt)}` : ""}
                        </span>
                      ) : (
                        <Badge variant="outline">Aucune action à faire</Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </LoadingGate>
  );
}
