import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export function DashboardBlock({
  title,
  emptyTitle,
  emptyDescription,
  className,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </CardContent>
    </Card>
  );
}
