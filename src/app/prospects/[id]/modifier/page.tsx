import { EditProspect } from "@/components/prospects/edit-prospect";

export default async function EditProspectPage({
  params,
}: PageProps<"/prospects/[id]/modifier">) {
  const { id } = await params;
  return <EditProspect id={id} />;
}
