import Link from "next/link";
import { notFound } from "next/navigation";
import { EntitySection } from "@/components/library/entity-section";
import { PageHeader } from "@/components/shared/page-header";
import { getEntityBySlug, libraryEntities } from "@/config/library";

export function generateStaticParams() {
  return libraryEntities.map(({ slug }) => ({ section: slug }));
}

export default async function LibrarySectionPage({
  params,
}: PageProps<"/bibliotheque/[section]">) {
  const { section: slug } = await params;
  const config = getEntityBySlug(slug);
  if (!config) notFound();

  return (
    <>
      <Link
        href="/bibliotheque"
        className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Bibliothèque
      </Link>
      <PageHeader title={config.label} description={config.description} />
      <EntitySection config={config} />
    </>
  );
}
