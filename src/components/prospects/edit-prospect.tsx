"use client";

import { LoadingGate } from "@/components/shared/loading-gate";
import { PageHeader } from "@/components/shared/page-header";
import { ProspectForm } from "@/components/prospects/prospect-form";
import { ProspectNotFound } from "@/components/prospects/prospect-not-found";
import { useCrm } from "@/lib/store/crm-store";

/** Page de modification : va chercher le prospect dans le store puis affiche le formulaire. */
export function EditProspect({ id }: { id: string }) {
  const { state } = useCrm();
  const prospect = state.prospects.find((p) => p.id === id);
  return (
    <LoadingGate>
      {prospect ? (
        <>
          <PageHeader title={`Modifier ${prospect.company}`} />
          <ProspectForm prospect={prospect} />
        </>
      ) : (
        <ProspectNotFound />
      )}
    </LoadingGate>
  );
}
