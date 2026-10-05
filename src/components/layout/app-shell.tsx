import Link from "next/link";
import { Zap } from "lucide-react";
import { BottomNav, SidebarNav } from "./nav-links";
import { SyncBanner } from "./sync-banner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
      <aside className="hidden border-r bg-card md:flex md:flex-col md:gap-6 md:p-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 font-semibold">
          <Zap className="size-5 text-primary" aria-hidden />
          Spark CRM
        </Link>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-2 border-b bg-card px-4 py-3 font-semibold md:hidden">
          <Zap className="size-5 text-primary" aria-hidden />
          Spark CRM
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <SyncBanner />
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
