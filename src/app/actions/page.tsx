import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function ActionsPage() {
  return (
    <>
      <PageHeader
        title="Actions"
        description="Appels, visites, emails, relances et rendez-vous à réaliser."
      />
      <EmptyState
        title="Aucune action"
        description="Chaque interaction doit déboucher sur une prochaine action ou explicitement sur aucune."
      />
    </>
  );
}
