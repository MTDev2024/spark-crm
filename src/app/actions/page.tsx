import { ActionsBoard } from "@/components/actions/actions-board";
import { PageHeader } from "@/components/shared/page-header";

export default function ActionsPage() {
  return (
    <>
      <PageHeader
        title="Actions"
        description="Appels, visites, emails, relances et rendez-vous à réaliser."
      />
      <ActionsBoard />
    </>
  );
}
