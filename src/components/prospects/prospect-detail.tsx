"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingGate } from "@/components/shared/loading-gate";
import { PageHeader } from "@/components/shared/page-header";
import { toDateString } from "@/lib/domain/actions";
import { deleteProspect, useCrm } from "@/lib/store/crm-store";
import type { Prospect } from "@/types/domain";
import { ActionsPanel } from "./actions-panel";
import { DataPointsPanel } from "./data-points-panel";
import { InteractionsPanel } from "./interactions-panel";
import { ProspectNotFound } from "./prospect-not-found";
import { ReadinessPanel } from "./readiness-panel";

/** Une ligne « libellé : valeur » ; une valeur absente s'affiche « Inconnu » (jamais inventée). */
function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">
        {value ?? <span className="text-muted-foreground">Inconnu</span>}
      </dd>
    </div>
  );
}

function IdentityCard({ prospect }: { prospect: Prospect }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identité</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-2">
          <Row label="Contact" value={prospect.contactName} />
          <Row label="Fonction" value={prospect.contactRole} />
          <Row label="Activité" value={prospect.activity} />
          <Row label="Catégorie" value={prospect.category} />
          <Row label="Téléphone" value={prospect.phone} />
          <Row label="Email" value={prospect.email} />
          <Row label="Adresse" value={prospect.address} />
          <Row label="Ville" value={prospect.city} />
        </dl>
      </CardContent>
    </Card>
  );
}

/**
 * Fiche prospect : assemble les panneaux (identité, exploitabilité, actions,
 * historique, données). Chaque panneau est un composant autonome qui gère
 * son propre formulaire d'ajout.
 *
 * Les boutons IA (Qualifier, Préparer un appel…) arriveront aux phases 5 et 6.
 */
export function ProspectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { state } = useCrm();
  const prospect = state.prospects.find((p) => p.id === id);

  return (
    <LoadingGate>
      {!prospect ? (
        <ProspectNotFound />
      ) : (
        <>
          <Link
            href="/prospects"
            className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Prospects
          </Link>
          <PageHeader
            title={prospect.company}
            description={
              [prospect.activity, prospect.city].filter(Boolean).join(" · ") ||
              undefined
            }
            actions={
              <div className="flex gap-2">
                <Link
                  href={`/prospects/${prospect.id}/modifier`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Pencil className="size-4" aria-hidden />
                  Modifier
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Suppression en cascade : on demande confirmation.
                    if (
                      window.confirm(
                        `Supprimer « ${prospect.company} » et tout son historique ?`,
                      )
                    ) {
                      deleteProspect(prospect.id);
                      router.push("/prospects");
                    }
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Supprimer
                </Button>
              </div>
            }
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <IdentityCard prospect={prospect} />
              <ReadinessPanel prospect={prospect} />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-2">
              <ActionsPanel
                prospectId={prospect.id}
                actions={state.actions.filter((a) => a.prospectId === prospect.id)}
                today={toDateString(new Date())}
              />
              <InteractionsPanel
                prospectId={prospect.id}
                interactions={state.interactions.filter((i) => i.prospectId === prospect.id)}
                actions={state.actions}
              />
              <DataPointsPanel
                prospectId={prospect.id}
                dataPoints={state.dataPoints.filter((d) => d.prospectId === prospect.id)}
              />
            </div>
          </div>
        </>
      )}
    </LoadingGate>
  );
}
