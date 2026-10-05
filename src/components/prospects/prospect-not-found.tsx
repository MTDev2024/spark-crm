import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

/** Affiché quand l'identifiant de l'URL ne correspond à aucun prospect (supprimé, autre navigateur…). */
export function ProspectNotFound() {
  return (
    <div className="flex flex-col gap-3">
      <EmptyState
        title="Prospect introuvable"
        description="Il a peut-être été supprimé. Les données sont enregistrées dans ce navigateur."
      />
      <Link href="/prospects" className="text-center text-sm underline">
        Retour à la liste
      </Link>
    </div>
  );
}
