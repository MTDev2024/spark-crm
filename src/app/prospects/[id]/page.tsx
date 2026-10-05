import { ProspectDetail } from "@/components/prospects/prospect-detail";

export default async function ProspectPage({
  params,
}: PageProps<"/prospects/[id]">) {
  const { id } = await params;
  return <ProspectDetail id={id} />;
}
