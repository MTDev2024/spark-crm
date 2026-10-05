"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Connexion par email et mot de passe. Pas d'inscription : le compte est créé
 * par l'administrateur dans Supabase, et les inscriptions publiques sont fermées.
 */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const { error: authError } = await getSupabaseBrowserClient().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });

    if (authError) {
      // Message volontairement générique : ne pas révéler si l'email existe.
      setError("Email ou mot de passe incorrect.");
      setPending(false);
      return;
    }
    // Rechargement complet : repart d'un état propre avec la session active.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- rechargement complet voulu
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border bg-card p-6">
      <Field label="Email" name="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Field label="Mot de passe" name="password" error={error ?? undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
