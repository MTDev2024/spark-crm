# Guide de développement

Ce document explique comment le code est organisé et par où commencer pour le relire.

## Installation

```bash
npm install
cp .env.example .env.local     # puis renseigner les deux variables Supabase
npm run dev                    # http://localhost:3000
npm run typecheck && npm run lint && npm test && npm run build   # vérifications avant commit
```

### Mettre en place Supabase (une seule fois)

1. Créer un projet Supabase (région Europe, Postgres standard). Réglages recommandés : Data API activée, « exposition automatique des nouvelles tables » désactivée, RLS automatique activée.
2. Copier l'URL du projet et la clé **publishable** dans `.env.local` (voir `.env.example`). Jamais la clé « secret ».
3. Exécuter le contenu de `supabase/migrations/*.sql` dans **SQL Editor** (dans l'ordre des fichiers).
4. **Authentication → Users → Add user** : créer son compte avec « Auto Confirm User ».
5. **Authentication → Sign In / Providers** : désactiver « Allow new users to sign up » (application mono-utilisateur).

## Où se trouve quoi

| Je cherche… | Fichier |
| --- | --- |
| Les types du métier (prospect, action…) | `src/types/domain.ts` |
| Le schéma de la base et les règles de sécurité | `supabase/migrations/` |
| Les libellés français affichés | `src/config/labels.ts` |
| Les entrées du menu | `src/config/navigation.ts` |
| Où sont lues et écrites les données prospects | `src/lib/store/crm-store.ts` |
| Où sont lues et écrites les données de la bibliothèque | `src/lib/store/library-store.ts` |
| Les champs des méthodes, offres, sources… | `src/config/library.ts` |
| Conversion base ↔ application | `src/lib/store/mappers.ts` |
| Connexion à Supabase, protection des pages | `src/lib/supabase/`, `src/proxy.ts` |
| Les règles métier (échéances, tri, exploitabilité) | `src/lib/domain/` |
| La validation des formulaires | `src/lib/validation/` |
| Une page | `src/app/(app)/<route>/page.tsx` (`/login` est hors du groupe `(app)`) |
| Un écran / panneau | `src/components/<domaine>/` |

## Comment circulent les données

```text
Formulaire (composant client)
  → parseForm(schéma Zod)      validation, "" devient null
  → fonction du store           addProspect, addAction, addInteraction…
  → mémoire mise à jour         l'écran réagit tout de suite
  → file d'écriture             envoi à Supabase, une écriture après l'autre
  → useCrm()                    les composants abonnés se redessinent
```

- **Lecture** : `const { state, hydrated, error } = useCrm()`. Au premier abonnement, tout est chargé depuis Supabase.
- **Écriture** : on appelle les fonctions du store, jamais Supabase directement depuis un composant.
- **Échec d'écriture** : le bandeau rouge (`SyncBanner`) s'affiche et les données sont rechargées depuis la base.
- **`hydrated`** : faux tant que les données ne sont pas chargées. `LoadingGate` évite d'afficher « aucun prospect » trop tôt.
- Les identifiants sont générés côté navigateur (UUID) pour pouvoir naviguer vers une fiche aussitôt créée.

## Authentification et sécurité

- `src/proxy.ts` (convention Next.js 16, ex-« middleware ») appelle `lib/supabase/session.ts` avant chaque page : sans session valide → `/login`.
- Connexion par email + mot de passe ; pas d'inscription publique.
- Connexion et déconnexion rechargent la page entièrement, ce qui vide les données en mémoire de l'utilisateur précédent.
- **Isolation des données : assurée par la base (RLS).** Chaque table a `user_id` (rempli automatiquement) et une politique qui limite l'accès aux lignes de l'utilisateur connecté. Les tables enfants vérifient aussi que le prospect référencé appartient à l'utilisateur.
- Le code navigateur ne contient que l'URL et la clé publishable.

## Règles à respecter quand on ajoute du code

1. **Inconnu = `null`.** Un champ vide d'un formulaire devient `null` (`optionalText` dans `validation/form.ts`), jamais une valeur inventée. L'interface affiche « Inconnu ».
2. **Logique métier dans `src/lib/`**, pas dans les composants : elle reste testable.
3. **Chaque règle métier a un test** (`*.test.ts` à côté du fichier).
4. **Une interaction débouche sur une action ou sur « aucune »** : voir `interactionFormSchema`, `addInteraction` et la contrainte SQL.
5. **Aucune donnée fictive** dans l'application.
6. **Aucun secret dans le code.** Les clés vont dans `.env.local` (ignoré par Git).
7. **Toute nouvelle table** : RLS activée, politique par utilisateur, `grant` explicite au rôle `authenticated`, dans une nouvelle migration.

## Modifier la base

Ne pas modifier une migration déjà appliquée. Créer un nouveau fichier `supabase/migrations/AAAAMMJJHHMMSS_description.sql`, l'exécuter dans SQL Editor, et adapter `types/domain.ts`, `store/mappers.ts` et le store.

## Ajouter un champ à un élément de la bibliothèque

1. Nouvelle migration SQL (`alter table … add column …`).
2. Ajouter le champ dans la description du type, dans `src/config/library.ts`. Le formulaire, la validation et l'affichage suivent automatiquement.

Pour un nouveau type d'élément : nouvelle table (avec RLS et `grant`), ajouter son nom dans `LibraryTable` (`types/library.ts`) et dans `libraryTables` (`library-store.ts`), puis une entrée dans `config/library.ts`.

## Ajouter un champ à un prospect (exemple)

1. Nouvelle migration : `alter table public.prospects add column …`.
2. Ajouter le champ dans `Prospect` (`src/types/domain.ts`) et dans `mappers.ts`.
3. L'ajouter au schéma `prospectFormSchema` (`src/lib/validation/prospect.ts`).
4. L'ajouter au formulaire (`prospect-form.tsx`) et à la fiche (`prospect-detail.tsx`).
5. Ajuster les tests.

## Conventions

- Interface et commentaires en français ; identifiants du code en anglais.
- Dates : chaînes `YYYY-MM-DD` en jour local (se comparent comme du texte).
- Commits : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, message décrivant uniquement le travail réalisé.
