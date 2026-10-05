import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Compte et préférences." />
      <EmptyState
        title="Aucun paramètre disponible"
        description="L'authentification et les préférences arrivent avec l'intégration Supabase."
      />
    </>
  );
}
