import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DashboardBlock } from "@/components/dashboard/dashboard-block";
import {
  AlertsBlock,
  RecentProspectsBlock,
  TodayBlock,
} from "@/components/dashboard/live-blocks";
import { PageHeader } from "@/components/shared/page-header";

/**
 * Dashboard. Trois blocs sont déjà alimentés par les vraies données
 * (À faire aujourd'hui, Alertes, Prospects récents). Les autres sont des
 * emplacements vides, branchés dans les phases suivantes (qualification,
 * relances, analytics).
 */
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quelle est la meilleure action commerciale à effectuer maintenant ?"
        actions={
          <Link href="/prospects/nouveau" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden />
            Nouveau prospect
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <TodayBlock className="lg:col-span-2" />
        <AlertsBlock />
        <DashboardBlock
          title="Prospects à qualifier"
          emptyTitle="Disponible avec la qualification"
        />
        <DashboardBlock title="Relances" emptyTitle="Disponible avec les relances" />
        <RecentProspectsBlock />
        <DashboardBlock
          title="Activité"
          emptyTitle="Pas encore d'activité"
          emptyDescription="Les statistiques ne seront affichées que lorsque l'échantillon sera suffisant."
        />
        <DashboardBlock
          title="Performance"
          emptyTitle="Pas encore de données"
          emptyDescription="Taux de réponse, de rendez-vous et de closing viendront avec l'historique."
        />
      </div>
    </>
  );
}
