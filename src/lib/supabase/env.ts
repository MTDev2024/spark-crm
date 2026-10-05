/**
 * Lecture des variables d'environnement Supabase.
 *
 * Les deux valeurs sont PUBLIQUES par conception (URL du projet et clé
 * « publishable ») : la sécurité repose sur la sécurité par ligne (RLS) de la
 * base, pas sur le secret de ces valeurs. La clé « secret » ne doit jamais
 * apparaître dans ce projet.
 *
 * Important : on écrit `process.env.NEXT_PUBLIC_…` en toutes lettres, car Next.js
 * remplace ces expressions exactes au moment du build pour le code navigateur.
 */
export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes : renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local, puis relancer le serveur.",
    );
  }
  return { url, key };
}
