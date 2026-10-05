import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { librarySections } from "@/config/navigation";

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Bibliothèque"
        description="La base commerciale utilisée pour préparer chaque action."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {librarySections.map((section) => (
          <Link key={section.slug} href={`/bibliotheque/${section.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{section.label}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
