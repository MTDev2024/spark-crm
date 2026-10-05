# Architecture

## Principes

- Simple et modulaire : pas d'abstraction avant le besoin.
- Logique métier dans `src/lib/`, jamais dispersée dans les composants.
- Sorties IA validées par schémas Zod.
- Secrets et appels IA uniquement côté serveur.

## Structure actuelle

```text
src/
  proxy.ts             protection des pages (redirige vers /login sans session)
  app/                 routes (App Router)
    login/             connexion (sans menu)
    (app)/             pages de l'application, avec menu
      dashboard/ actions/ parametres/
      prospects/       liste, nouveau/, [id]/ (fiche), [id]/modifier/
      bibliotheque/[section]/
  components/
    ui/                shadcn/ui
    layout/            shell, navigation (sidebar desktop, barre basse mobile)
    dashboard/         blocs du dashboard (live-blocks = données réelles)
    prospects/         liste, formulaire, fiche et ses panneaux
    actions/           ligne d'action réutilisable, page Actions
    shared/            en-tête de page, champs de formulaire, état vide…
  config/              navigation, libellés français
  lib/
    domain/            règles métier pures : exploitabilité par canal, échéances et tri des actions
    store/             crm-store (données + hook useCrm), mappers base ↔ application
    supabase/          clients navigateur et session, lecture des variables d'environnement
    validation/        schémas Zod : formulaires et qualification
  types/domain.ts      types fondamentaux
supabase/migrations/   schéma SQL et règles de sécurité (RLS)
```

Voir [DEVELOPMENT.md](DEVELOPMENT.md) pour le flux de données et les conventions.

Les dossiers `lib/supabase`, `lib/ai`, `lib/research`… seront créés quand ils auront du contenu.

## Décisions

| Décision | Raison |
| --- | --- |
| Navigation mobile en barre basse | usage terrain, pouce |
| Routes en français (`/bibliotheque`, `/parametres`) | cohérence avec l'interface |
| Bibliothèque en une route dynamique `[section]` | six sections au rendu identique pour l'instant |
| Vitest | léger, sans configuration lourde, tests de la logique métier |
| Pas de données fictives | tout bloc vide affiche un état vide explicite |
| Données dans Supabase (phase 3) | persistance, accès multi-appareils, isolation par RLS ; tout passe par `lib/store/crm-store.ts`, les écrans n'appellent jamais la base directement |
| Mise à jour optimiste + file d'écriture | l'interface reste instantanée ; les écritures partent dans l'ordre (un prospect avant ses actions) ; en cas d'échec, bandeau d'erreur et rechargement depuis la base |
| UUID générés côté navigateur | permet de naviguer vers une fiche aussitôt créée, sans attendre la base |
| Sécurité par la base (RLS), pas par le code | même si le code du navigateur est modifié, la base refuse l'accès aux lignes d'un autre utilisateur |
| Droits explicites (`grant`) | l'exposition automatique des tables est désactivée sur le projet |
| Une seule clé publique côté navigateur | la clé « secret » n'est utilisée nulle part |
| Connexion email + mot de passe, inscriptions fermées | application mono-utilisateur ; OAuth (Google, GitHub) pourra s'ajouter sans migrer les données |
| `proxy.ts` pour protéger les pages | convention Next.js 16 (ancien « middleware ») |
| Groupe de routes `(app)` | le menu s'affiche sur les pages de l'application mais pas sur `/login` |
| `useSyncExternalStore` pour le store | mécanisme React standard pour un état externe, sans dépendance supplémentaire |
| Formulaires en `FormData` + Zod | pas de bibliothèque de formulaires : peu de champs, validation centralisée dans `lib/validation` |
| Dates en `YYYY-MM-DD` local | échéances au jour près ; comparables comme du texte, sans piège de fuseau horaire |
| Suppression d'un prospect en cascade | actions, interactions et données rattachées sont supprimées, après confirmation |
| `eslint` audité mais non « fixé » | les alertes `npm audit` concernent l'outillage de lint, pas l'exécution ; `--force` rétrograderait Next |

## Prochaines couches

Tables de la base commerciale (méthodes, sources, offres…), puis `lib/ai` (client OpenAI serveur, contexte dynamique, journal des appels).
