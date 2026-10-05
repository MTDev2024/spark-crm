import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { libraryEntities } from "@/config/library";

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Bibliothèque"
        description="La base commerciale utilisée pour préparer chaque action."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {libraryEntities.map((entity) => (
          <Link key={entity.slug} href={`/bibliotheque/${entity.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{entity.label}</CardTitle>
                <CardDescription>{entity.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
