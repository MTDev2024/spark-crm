import { AccountPanel } from "@/components/auth/account-panel";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Paramètres" description="Compte et préférences." />
      <AccountPanel />
    </>
  );
}
