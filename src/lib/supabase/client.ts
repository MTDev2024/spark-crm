import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Client Supabase pour le navigateur. Une seule instance est réutilisée.
 * Il envoie automatiquement le jeton de l'utilisateur connecté, ce qui
 * permet à la base d'appliquer la sécurité par ligne (RLS).
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, key } = getSupabaseEnv();
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}
