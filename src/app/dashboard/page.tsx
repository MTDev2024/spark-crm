import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DashboardBlock } from "@/components/dashboard/dashboard-block";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Quelle est la meilleure action commerciale à effectuer maintenant ?"
        actions={
          <Link href="/prospects" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden />
            Nouveau prospect
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardBlock
          className="lg:col-span-2"
          title="À faire aujourd'hui"
          emptyTitle="Aucune action prévue"
          emptyDescription="Les actions en retard, du jour, relances, appels et visites apparaîtront ici."
        />
        <DashboardBlock
          title="Alertes commerciales"
          emptyTitle="Aucune alerte"
          emptyDescription="Prospects sans prochaine action, relances en retard…"
        />
        <DashboardBlock
          title="Prospects à qualifier"
          emptyTitle="Aucun prospect à qualifier"
        />
        <DashboardBlock title="Relances" emptyTitle="Aucune relance en attente" />
        <DashboardBlock title="Prospects récents" emptyTitle="Aucun prospect" />
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
