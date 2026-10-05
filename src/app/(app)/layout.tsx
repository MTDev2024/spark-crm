import { AppShell } from "@/components/layout/app-shell";

/** Layout des pages de l'application (après connexion) : menu + zone de contenu. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
