import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ProspectList } from "@/components/prospects/prospect-list";

export default function ProspectsPage() {
  return (
    <>
      <PageHeader
        title="Prospects"
        description="Tous vos prospects, leur contexte et leur historique."
        actions={
          <Link href="/prospects/nouveau" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden />
            Nouveau prospect
          </Link>
        }
      />
      <ProspectList />
    </>
  );
}
