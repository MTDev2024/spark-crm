import { PageHeader } from "@/components/shared/page-header";
import { ProspectForm } from "@/components/prospects/prospect-form";

export default function NewProspectPage() {
  return (
    <>
      <PageHeader
        title="Nouveau prospect"
        description="Seul le nom est obligatoire. Le reste peut être complété plus tard."
      />
      <ProspectForm />
    </>
  );
}
