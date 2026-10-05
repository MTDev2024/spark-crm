import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { librarySections } from "@/config/navigation";

export function generateStaticParams() {
  return librarySections.map(({ slug }) => ({ section: slug }));
}

export default async function LibrarySectionPage({
  params,
}: PageProps<"/bibliotheque/[section]">) {
  const { section: slug } = await params;
  const section = librarySections.find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <>
      <Link
        href="/bibliotheque"
        className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Bibliothèque
      </Link>
      <PageHeader title={section.label} description={section.description} />
      <EmptyState
        title={`Aucun élément dans « ${section.label} »`}
        description="Cette section sera alimentée lors de la phase base commerciale."
      />
    </>
  );
}
