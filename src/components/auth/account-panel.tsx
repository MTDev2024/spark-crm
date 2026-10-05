"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Compte connecté : affiche l'email et permet de se déconnecter. */
export function AccountPanel() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    // Rechargement complet : vide les données en mémoire de l'utilisateur précédent.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement complet voulu
    window.location.href = "/login";
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Compte</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm">
          <span className="text-muted-foreground">Connecté en tant que </span>
          {email ?? "…"}
        </p>
        <Button variant="outline" onClick={handleLogout} className="self-start">
          <LogOut className="size-4" aria-hidden />
          Se déconnecter
        </Button>
      </CardContent>
    </Card>
  );
}
