"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/components/actions/action-item";
import { dataStatusLabels, infoKindLabels } from "@/config/labels";
import { deleteDataPoint } from "@/lib/store/crm-store";
import type { StoredDataPoint } from "@/types/domain";
import { DataPointForm } from "./data-point-form";

/**
 * Données du prospect avec leur provenance. Chaque ligne montre la valeur
 * (ou « Inconnu »), sa nature (fait / signal / hypothèse), son statut et sa source.
 */
export function DataPointsPanel({
  prospectId,
  dataPoints,
}: {
  prospectId: string;
  dataPoints: StoredDataPoint[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Données et écosystème</CardTitle>
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Ajouter une donnée
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {adding ? (
          <DataPointForm prospectId={prospectId} onDone={() => setAdding(false)} />
        ) : null}
        {dataPoints.length === 0 && !adding ? (
          <EmptyState
            title="Aucune donnée"
            description="Site, outils, réseaux sociaux… Ce qui n'est pas renseigné reste inconnu."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {dataPoints.map((point) => (
              <li key={point.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{point.key}</p>
                  <p className="text-sm">
                    {point.value ?? <span className="text-muted-foreground">Inconnu</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{infoKindLabels[point.kind]}</Badge>
                    <Badge variant="outline">{dataStatusLabels[point.status]}</Badge>
                    {point.source ? (
                      <span className="text-xs text-muted-foreground">Source : {point.source}</span>
                    ) : null}
                    {point.collectedAt ? (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(point.collectedAt)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Supprimer ${point.key}`}
                  onClick={() => {
                    if (window.confirm(`Supprimer « ${point.key} » ?`)) deleteDataPoint(point.id);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
