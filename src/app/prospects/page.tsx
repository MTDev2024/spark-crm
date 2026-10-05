import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function ProspectsPage() {
  return (
    <>
      <PageHeader
        title="Prospects"
        description="Tous vos prospects, leur contexte et leur historique."
      />
      <EmptyState
        title="Aucun prospect"
        description="La création de prospects arrive à la prochaine étape."
      />
    </>
  );
}
